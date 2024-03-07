
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

// TEST 1 (get-count)
Clarinet.test({
    name: "get-count returns u0 for principals that never called count-up before",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // get the deployer account
        let deployer = accounts.get("deployer")!;

        // call the get-count read-only function
        // the first parameter is the contract name, the second
        // the function name, and the third the function arguments
        // as an array, the final parameter is the tx-sender
        let count = chain.callReadOnlyFn("counter", "get-count", [
            types.principal(deployer.address)
        ], deployer.address);

        count.result.expectUint(0);
    }
});

// TEST 2 (count-up)
Clarinet.test({
    name: "count-up counts up for the tx-sender",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // get the deployer account
        let deployer = accounts.get("deployer")!;

        // mine a block with one transaction
        let block = chain.mineBlock([
            Tx.contractCall("counter", "count-up", [], deployer.address),
        ]);

        // get the first (and only) transaction receipt
        let [receipt] = block.receipts;
        
        // assert that the returned result is a boolean true
        receipt.result.expectOk().expectBool(true);

        // get the counter value
        let count = chain.callReadOnlyFn("counter", "get-count", [
            types.principal(deployer.address)
        ], deployer.address);

        // assert that the returned result is a u1
        count.result.expectUint(1);
    },
});

// TEST 3 (testing multiplayer aspect)
Clarinet.test({
    name: "counters are specific to the tx-sender",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // get some accounts
        let deployer = accounts.get("deployer")!;
        let wallet1 = accounts.get("wallet_1")!;
        let wallet2 = accounts.get("wallet_2")!;

        // mine a few contract calls to count-up
        let block = chain.mineBlock([
            // the deployer account calls count-up zero times

            // wallet 1 calls count-up one time
            Tx.contractCall("counter", "count-up", [], wallet1.address),

            // wallet 2 calls count-up two times
            Tx.contractCall("counter", "count-up", [], wallet2.address),
            Tx.contractCall("counter", "count-up", [], wallet2.address)
        ]);

        // get and assert the counter value for deployer
        let deployerCount = chain.callReadOnlyFn("counter", "get-count", [
            types.principal(deployer.address)
        ], deployer.address);
        deployerCount.result.expectUint(0);

        // get and assert the counter value for wallet 1
        let wallet1Count = chain.callReadOnlyFn("counter", "get-count", [
            types.principal(wallet1.address)
        ], wallet1.address);
        wallet1Count.result.expectUint(1);

        // get and assert the counter value for wallet 2
        let wallet2Count = chain.callReadOnlyFn("counter", "get-count", [
            types.principal(wallet2.address)
        ], wallet2.address);
        wallet2Count.result.expectUint(2);

    }
});

