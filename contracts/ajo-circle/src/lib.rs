#![no_std]

//! Ajo circle contract — a trustless rotating savings & credit association
//! (ROSCA), the mechanic known as Ajo/Esusu (Nigeria), Chama (Kenya), Tanda
//! (Mexico), and Susu (Ghana/Caribbean).
//!
//! A fixed group of members each contribute the same amount every cycle;
//! one member takes the full pot per cycle, in join order, until everyone
//! has been paid once. The informal version runs on trust in an organizer
//! who physically holds the pot — this contract holds it instead, so no
//! single person can vanish with it. Payout only requires either every
//! member's contribution for the cycle, or the cycle deadline passing (so
//! one non-payer can't freeze the group's funds forever).

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, Vec,
};

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum CircleStatus {
    Forming = 0,
    Active = 1,
    Completed = 2,
}

#[contracttype]
#[derive(Clone)]
pub struct Circle {
    pub id: u64,
    pub creator: Address,
    pub token: Address,
    pub contribution_amount: i128,
    pub max_members: u32,
    pub cycle_length_secs: u64,
    /// Join order doubles as payout order — first to join is paid first.
    /// Simple and transparent to verify on-chain, with no separate
    /// randomization step to trust.
    pub members: Vec<Address>,
    pub started_at: u64,
    pub current_cycle: u32,
    pub status: CircleStatus,
}

#[contracttype]
pub enum DataKey {
    NextCircleId,
    Circle(u64),
    Contribution(u64, u32, Address),
    MissedCount(u64, Address),
}

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    CircleNotFound = 1,
    CircleFull = 2,
    AlreadyMember = 3,
    CircleNotForming = 4,
    CircleNotActive = 5,
    NotAMember = 6,
    AlreadyContributed = 7,
    CycleNotReady = 8,
    InvalidParams = 9,
}

#[contract]
pub struct AjoCircleContract;

#[contractimpl]
impl AjoCircleContract {
    /// Start a new circle. The creator is automatically its first member.
    pub fn create_circle(
        env: Env,
        creator: Address,
        token: Address,
        contribution_amount: i128,
        max_members: u32,
        cycle_length_secs: u64,
    ) -> Result<u64, ContractError> {
        creator.require_auth();

        if contribution_amount <= 0 || max_members < 2 || cycle_length_secs == 0 {
            return Err(ContractError::InvalidParams);
        }

        let id = next_id(&env, DataKey::NextCircleId);
        let mut members = Vec::new(&env);
        members.push_back(creator.clone());

        let circle = Circle {
            id,
            creator,
            token,
            contribution_amount,
            max_members,
            cycle_length_secs,
            members,
            started_at: 0,
            current_cycle: 0,
            status: CircleStatus::Forming,
        };
        env.storage().persistent().set(&DataKey::Circle(id), &circle);

        env.events()
            .publish((symbol_short!("circle"), symbol_short!("created")), id);

        Ok(id)
    }

    /// Join a forming circle. Once the last slot fills, the circle becomes
    /// Active immediately — no separate "start" step, so there's no window
    /// where a full circle sits idle waiting on someone to kick it off.
    pub fn join_circle(env: Env, circle_id: u64, member: Address) -> Result<(), ContractError> {
        member.require_auth();

        let mut circle = Self::get_circle(env.clone(), circle_id)?;
        if circle.status != CircleStatus::Forming {
            return Err(ContractError::CircleNotForming);
        }
        if is_member(&circle.members, &member) {
            return Err(ContractError::AlreadyMember);
        }
        if circle.members.len() >= circle.max_members {
            return Err(ContractError::CircleFull);
        }

        circle.members.push_back(member);

        if circle.members.len() == circle.max_members {
            circle.status = CircleStatus::Active;
            circle.started_at = env.ledger().timestamp();
        }

        env.storage().persistent().set(&DataKey::Circle(circle_id), &circle);

        env.events()
            .publish((symbol_short!("circle"), symbol_short!("joined")), circle_id);

        Ok(())
    }

    /// Pay this cycle's contribution into the circle's on-chain pool.
    pub fn contribute(env: Env, circle_id: u64, member: Address) -> Result<(), ContractError> {
        member.require_auth();

        let circle = Self::get_circle(env.clone(), circle_id)?;
        if circle.status != CircleStatus::Active {
            return Err(ContractError::CircleNotActive);
        }
        if !is_member(&circle.members, &member) {
            return Err(ContractError::NotAMember);
        }

        let key = DataKey::Contribution(circle_id, circle.current_cycle, member.clone());
        if env.storage().persistent().has(&key) {
            return Err(ContractError::AlreadyContributed);
        }

        token::Client::new(&env, &circle.token).transfer(
            &member,
            &env.current_contract_address(),
            &circle.contribution_amount,
        );

        env.storage().persistent().set(&key, &true);

        env.events().publish(
            (symbol_short!("circle"), symbol_short!("paid")),
            (circle_id, member),
        );

        Ok(())
    }

    /// Pay out the current cycle's recipient and advance to the next cycle.
    /// Callable by anyone (a permissionless keeper, or any member) once
    /// either every member has contributed, or the cycle deadline has
    /// passed — whichever comes first, so one missing member can't freeze
    /// everyone else's money indefinitely. A member who misses a deadline
    /// gets a strike recorded against them (`missed_count`).
    pub fn disburse(env: Env, circle_id: u64) -> Result<Address, ContractError> {
        let mut circle = Self::get_circle(env.clone(), circle_id)?;
        if circle.status != CircleStatus::Active {
            return Err(ContractError::CircleNotActive);
        }

        let member_count = circle.members.len();
        let deadline =
            circle.started_at + (circle.current_cycle as u64 + 1) * circle.cycle_length_secs;
        let now = env.ledger().timestamp();

        let mut paid_count: u32 = 0;
        let mut pot: i128 = 0;
        for m in circle.members.iter() {
            let key = DataKey::Contribution(circle_id, circle.current_cycle, m.clone());
            if env.storage().persistent().has(&key) {
                paid_count += 1;
                pot += circle.contribution_amount;
            } else if now >= deadline {
                let miss_key = DataKey::MissedCount(circle_id, m.clone());
                let missed: u32 = env.storage().persistent().get(&miss_key).unwrap_or(0);
                env.storage().persistent().set(&miss_key, &(missed + 1));
            }
        }

        if paid_count < member_count && now < deadline {
            return Err(ContractError::CycleNotReady);
        }

        let recipient = circle.members.get(circle.current_cycle).unwrap();
        if pot > 0 {
            token::Client::new(&env, &circle.token).transfer(
                &env.current_contract_address(),
                &recipient,
                &pot,
            );
        }

        circle.current_cycle += 1;
        if circle.current_cycle == member_count {
            circle.status = CircleStatus::Completed;
        }
        env.storage().persistent().set(&DataKey::Circle(circle_id), &circle);

        env.events().publish(
            (symbol_short!("circle"), symbol_short!("payout")),
            (circle_id, recipient.clone()),
        );

        Ok(recipient)
    }

    pub fn get_circle(env: Env, circle_id: u64) -> Result<Circle, ContractError> {
        env.storage()
            .persistent()
            .get(&DataKey::Circle(circle_id))
            .ok_or(ContractError::CircleNotFound)
    }

    pub fn has_contributed(env: Env, circle_id: u64, cycle: u32, member: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Contribution(circle_id, cycle, member))
    }

    pub fn missed_count(env: Env, circle_id: u64, member: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::MissedCount(circle_id, member))
            .unwrap_or(0)
    }

    /// Total number of circles ever created — circle ids are sequential
    /// starting at 1, so this doubles as the id of the most recently
    /// created circle.
    pub fn total_circles(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::NextCircleId).unwrap_or(0)
    }
}

fn is_member(members: &Vec<Address>, addr: &Address) -> bool {
    for m in members.iter() {
        if &m == addr {
            return true;
        }
    }
    false
}

fn next_id(env: &Env, key: DataKey) -> u64 {
    let current: u64 = env.storage().instance().get(&key).unwrap_or(0);
    let next = current + 1;
    env.storage().instance().set(&key, &next);
    next
}

mod test;
