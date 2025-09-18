import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req,res) {
        try {
            const { userId } = req.params;

            const transaction = await sql `
            SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC
            `
            res.status(200).json(transaction);
        } catch (error) {
            console.log("Error u dohvaćanju transakcije. ", error);
            res.status(500).json({message:"Error na serveru."});
        }
};

export async function createTransaction(req,res) {
    //title, amount, category, user_id
    try {
        const { title, amount, category, user_id } = req.body;
        if(!title || !user_id || !category || amount=== undefined){
            return res.status(400).json({message: "Sva polja moraju biti popunjena. "});
        }

        const transaction = await sql `
        INSERT INTO transactions(user_id, title, amount, category)
        VALUES (${user_id}, ${title}, ${amount}, ${category})
        RETURNING *
        `
        console.log(transaction);
        res.status(201).json(transaction[0]);
    
    } catch (error) {
        console.log("Greška ", error);
        res.status(500).json({message: "Error na serveru."});
    }
}

export async function deleteTransaction(req,res) {
    try {
        const {id} = req.params;
        if(isNaN(parseInt(id))){
            return res.status(400).json({message:"Nepostojeći ID."});
        }

        const result = await sql `
        DELETE FROM transactions WHERE id = ${id} RETURNING *
        `
        if(result.length === 0){
            return res.status(404).json({message:"Nije pronađena transakcija. "});
        }
        res.status(200).json({message:"Uspješno izbrisana transakcija. "});

    } catch (error) {
        console.log("Error u brisanju transakcije", error);
        res.status(500).json({message: "Error na serveru."});
    }
};
export async function getSummaryByUserId(req,res){
    try {
        const {userId} = req.params;
        const balanceResult = await sql `
        SELECT COALESCE(SUM(amount),0) as balance FROM transactions where user_id = ${userId}
        `
        const incomeResult = await sql `
        SELECT COALESCE(SUM(amount),0) as income FROM transactions 
        WHERE user_id = ${userId} AND amount > 0
        `
        const expensesResult = await sql `
        SELECT COALESCE(SUM(amount),0) as expenses FROM transactions 
        WHERE user_id = ${userId} AND amount < 0
        `
        res.status(200).json({
            balance:balanceResult[0].balance,
            income:incomeResult[0].income,
            expenses:expensesResult[0].expenses
        })
    } catch (error) { 
console.log("Error u dohvaćanju sažetka", error);
        res.status(500).json({message: "Error na serveru."});
    }
};