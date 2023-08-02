use solana_client::rpc_client::RpcClient;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::signature::Signer;
use solana_sdk::{signature::Keypair, system_instruction, transaction::Transaction};

fn main() {
    let from_keypair = Keypair::new();

    let from_pubkey = from_keypair.pubkey();
    let new_account_keypair = Keypair::new();
    let new_account_pubkey = new_account_keypair.pubkey();

    let space = 80; // 10个u64字段，每个字段8字节
    let connection =
        RpcClient::new_with_commitment("http://127.0.0.1:8899", CommitmentConfig::finalized());

    let airdrop_sol_for_from_keypair = connection
        .request_airdrop(&from_pubkey, 10_000_000_000)
        .unwrap();
    dbg!(airdrop_sol_for_from_keypair);

    let airdrop_sol_for_new_account_pubkey = connection
        .request_airdrop(&new_account_pubkey, 10_000_000_000)
        .unwrap();
    dbg!(airdrop_sol_for_new_account_pubkey);

    let rent_exemption_amount = connection
        .get_minimum_balance_for_rent_exemption(space)
        .expect("break rent exemption amount");
    dbg!(rent_exemption_amount);

    let create_account_ix = system_instruction::create_account(
        &from_pubkey,
        &new_account_pubkey,
        rent_exemption_amount,
        space as u64,
        &from_pubkey,
    );

    let (recent_blockhash, _) = connection.get_recent_blockhash().unwrap();

    let create_account_tx = Transaction::new_signed_with_payer(
        &[create_account_ix],
        Some(&from_pubkey),
        &[&from_keypair, &new_account_keypair],
        recent_blockhash,
    );

    match connection.send_and_confirm_transaction(&create_account_tx) {
        Ok(sig) => loop {
            if let Ok(confirmed) = connection.confirm_transaction(&sig) {
                if confirmed {
                    println!("Transaction: {} Status: {}", sig, confirmed);
                    break;
                }
            }
        },
        Err(e) => println!("Error creating system account: {e:?}"),
    };
}
