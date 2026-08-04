#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token::StellarAssetClient,
    Env,
};

fn setup(env: &Env) -> AjoCircleContractClient<'_> {
    env.mock_all_auths();
    let contract_id = env.register(AjoCircleContract, ());
    AjoCircleContractClient::new(env, &contract_id)
}

fn create_token<'a>(env: &Env) -> (Address, token::Client<'a>, StellarAssetClient<'a>) {
    let admin = Address::generate(env);
    let sac = env.register_stellar_asset_contract_v2(admin);
    let address = sac.address();
    (
        address.clone(),
        token::Client::new(env, &address),
        StellarAssetClient::new(env, &address),
    )
}

const WEEK: u64 = 604_800;

#[test]
fn creates_a_circle_with_the_creator_as_first_member() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let creator = Address::generate(&env);

    let id = client.create_circle(&creator, &token, &1_000, &3, &WEEK);
    assert_eq!(id, 1);

    let circle = client.get_circle(&id);
    assert_eq!(circle.members.len(), 1);
    assert_eq!(circle.members.get(0).unwrap(), creator);
    assert_eq!(circle.status, CircleStatus::Forming);
}

#[test]
fn rejects_invalid_circle_parameters() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let creator = Address::generate(&env);

    assert_eq!(
        client.try_create_circle(&creator, &token, &0, &3, &WEEK),
        Err(Ok(ContractError::InvalidParams))
    );
    assert_eq!(
        client.try_create_circle(&creator, &token, &1_000, &1, &WEEK),
        Err(Ok(ContractError::InvalidParams))
    );
    assert_eq!(
        client.try_create_circle(&creator, &token, &1_000, &3, &0),
        Err(Ok(ContractError::InvalidParams))
    );
}

#[test]
fn circle_activates_once_full_and_locks_join_order_as_payout_order() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let c = Address::generate(&env);

    let id = client.create_circle(&a, &token, &1_000, &3, &WEEK);
    let mid_circle = client.get_circle(&id);
    assert_eq!(mid_circle.status, CircleStatus::Forming);

    client.join_circle(&id, &b);
    client.join_circle(&id, &c);

    let circle = client.get_circle(&id);
    assert_eq!(circle.status, CircleStatus::Active);
    assert_eq!(circle.members.get(0).unwrap(), a);
    assert_eq!(circle.members.get(1).unwrap(), b);
    assert_eq!(circle.members.get(2).unwrap(), c);
    assert_eq!(circle.started_at, env.ledger().timestamp());
}

#[test]
fn rejects_joining_a_full_or_already_active_circle() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let c = Address::generate(&env);
    let d = Address::generate(&env);

    let id = client.create_circle(&a, &token, &1_000, &2, &WEEK);
    client.join_circle(&id, &b);

    assert_eq!(
        client.try_join_circle(&id, &c),
        Err(Ok(ContractError::CircleNotForming))
    );
    let _ = d;
}

#[test]
fn rejects_the_same_member_joining_twice() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);

    let id = client.create_circle(&a, &token, &1_000, &3, &WEEK);

    assert_eq!(
        client.try_join_circle(&id, &a),
        Err(Ok(ContractError::AlreadyMember))
    );
    client.join_circle(&id, &b);
    assert_eq!(
        client.try_join_circle(&id, &b),
        Err(Ok(ContractError::AlreadyMember))
    );
}

#[test]
fn rejects_contributions_before_the_circle_is_active() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let a = Address::generate(&env);

    let id = client.create_circle(&a, &token, &1_000, &3, &WEEK);

    assert_eq!(
        client.try_contribute(&id, &a),
        Err(Ok(ContractError::CircleNotActive))
    );
}

#[test]
fn rejects_contributions_from_non_members() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, asset) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let outsider = Address::generate(&env);
    asset.mint(&a, &10_000);

    let id = client.create_circle(&a, &token, &1_000, &2, &WEEK);
    client.join_circle(&id, &b);

    assert_eq!(
        client.try_contribute(&id, &outsider),
        Err(Ok(ContractError::NotAMember))
    );
}

#[test]
fn full_cycle_pays_the_pot_to_the_first_member_and_advances() {
    let env = Env::default();
    let client = setup(&env);
    let (token, token_client, asset) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    asset.mint(&a, &10_000);
    asset.mint(&b, &10_000);

    let id = client.create_circle(&a, &token, &1_000, &2, &WEEK);
    client.join_circle(&id, &b);

    assert_eq!(
        client.try_disburse(&id),
        Err(Ok(ContractError::CycleNotReady))
    );

    client.contribute(&id, &a);
    assert!(client.has_contributed(&id, &0, &a));
    assert!(!client.has_contributed(&id, &0, &b));

    client.contribute(&id, &b);
    assert_eq!(token_client.balance(&a), 9_000);
    assert_eq!(token_client.balance(&b), 9_000);

    let recipient = client.disburse(&id);
    assert_eq!(recipient, a);
    assert_eq!(token_client.balance(&a), 11_000);

    let circle = client.get_circle(&id);
    assert_eq!(circle.current_cycle, 1);
    assert_eq!(circle.status, CircleStatus::Active);
}

#[test]
fn rejects_contributing_twice_in_the_same_cycle() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, asset) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    asset.mint(&a, &10_000);

    let id = client.create_circle(&a, &token, &1_000, &2, &WEEK);
    client.join_circle(&id, &b);

    client.contribute(&id, &a);
    assert_eq!(
        client.try_contribute(&id, &a),
        Err(Ok(ContractError::AlreadyContributed))
    );
}

#[test]
fn full_rotation_pays_every_member_exactly_once_and_completes() {
    let env = Env::default();
    let client = setup(&env);
    let (token, token_client, asset) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let c = Address::generate(&env);
    for m in [&a, &b, &c] {
        asset.mint(m, &10_000);
    }

    let id = client.create_circle(&a, &token, &1_000, &3, &WEEK);
    client.join_circle(&id, &b);
    client.join_circle(&id, &c);

    for cycle in 0..3u32 {
        client.contribute(&id, &a);
        client.contribute(&id, &b);
        client.contribute(&id, &c);
        let expected_recipient = client.get_circle(&id).members.get(cycle).unwrap();
        let recipient = client.disburse(&id);
        assert_eq!(recipient, expected_recipient);
    }

    let circle = client.get_circle(&id);
    assert_eq!(circle.status, CircleStatus::Completed);
    assert_eq!(circle.current_cycle, 3);

    // Each member put in 3_000 and got exactly one 3_000 pot back.
    assert_eq!(token_client.balance(&a), 10_000);
    assert_eq!(token_client.balance(&b), 10_000);
    assert_eq!(token_client.balance(&c), 10_000);
}

#[test]
fn a_missed_deadline_still_pays_out_the_partial_pot_and_records_a_strike() {
    let env = Env::default();
    let client = setup(&env);
    let (token, token_client, asset) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    asset.mint(&a, &10_000);
    asset.mint(&b, &10_000);

    let id = client.create_circle(&a, &token, &1_000, &2, &WEEK);
    client.join_circle(&id, &b);

    client.contribute(&id, &a);
    // b never contributes this cycle.

    env.ledger().with_mut(|l| l.timestamp += WEEK + 1);

    let recipient = client.disburse(&id);
    assert_eq!(recipient, a);
    // Only a's 1_000 made it into the pot.
    assert_eq!(token_client.balance(&a), 10_000);
    assert_eq!(client.missed_count(&id, &b), 1);

    let circle = client.get_circle(&id);
    assert_eq!(circle.current_cycle, 1);
}

#[test]
fn disburse_on_an_unknown_circle_fails() {
    let env = Env::default();
    let client = setup(&env);

    assert_eq!(
        client.try_disburse(&99),
        Err(Ok(ContractError::CircleNotFound))
    );
}

#[test]
fn total_circles_tracks_the_running_count() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let a = Address::generate(&env);

    assert_eq!(client.total_circles(), 0);

    client.create_circle(&a, &token, &1_000, &2, &WEEK);
    assert_eq!(client.total_circles(), 1);

    client.create_circle(&a, &token, &2_000, &3, &WEEK);
    assert_eq!(client.total_circles(), 2);
}

#[test]
fn a_member_can_leave_a_forming_circle() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let c = Address::generate(&env);

    let id = client.create_circle(&a, &token, &1_000, &4, &WEEK);
    client.join_circle(&id, &b);
    client.join_circle(&id, &c);

    client.leave_circle(&id, &b);

    let circle = client.get_circle(&id);
    assert_eq!(circle.members.len(), 2);
    assert_eq!(circle.members.get(0).unwrap(), a);
    assert_eq!(circle.members.get(1).unwrap(), c);
    assert_eq!(circle.status, CircleStatus::Forming);

    // The freed slot can be re-joined.
    client.join_circle(&id, &b);
    assert_eq!(client.get_circle(&id).members.len(), 3);
}

#[test]
fn rejects_leaving_a_circle_you_are_not_in_or_that_is_already_active() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let outsider = Address::generate(&env);

    let id = client.create_circle(&a, &token, &1_000, &2, &WEEK);

    assert_eq!(
        client.try_leave_circle(&id, &outsider),
        Err(Ok(ContractError::NotAMember))
    );

    client.join_circle(&id, &b); // circle fills and activates
    assert_eq!(
        client.try_leave_circle(&id, &a),
        Err(Ok(ContractError::CircleNotForming))
    );
}

#[test]
fn the_creator_can_cancel_a_forming_circle() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);

    let id = client.create_circle(&a, &token, &1_000, &3, &WEEK);
    client.join_circle(&id, &b);

    client.cancel_circle(&id, &a);

    let circle = client.get_circle(&id);
    assert_eq!(circle.status, CircleStatus::Cancelled);

    // A cancelled circle can no longer be joined.
    let c = Address::generate(&env);
    assert_eq!(
        client.try_join_circle(&id, &c),
        Err(Ok(ContractError::CircleNotForming))
    );
}

#[test]
fn rejects_cancellation_by_a_non_creator_or_of_an_active_circle() {
    let env = Env::default();
    let client = setup(&env);
    let (token, _, _) = create_token(&env);
    let a = Address::generate(&env);
    let b = Address::generate(&env);

    let id = client.create_circle(&a, &token, &1_000, &2, &WEEK);

    assert_eq!(
        client.try_cancel_circle(&id, &b),
        Err(Ok(ContractError::NotAuthorized))
    );

    client.join_circle(&id, &b); // circle fills and activates
    assert_eq!(
        client.try_cancel_circle(&id, &a),
        Err(Ok(ContractError::CircleNotForming))
    );
}
