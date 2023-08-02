use anchor_lang::prelude::*;

declare_id!("Eo7uunKkgdRe8JtgmDimLkUEuT1oYbua4zWRCysWpv45");

#[program]
pub mod hello_world {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Hello, World!");
        msg!("Hello, World! Anchor!!🦀️");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
