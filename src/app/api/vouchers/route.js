import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(req) {
  try {
    console.log("📡 Buscando vouchers no banco de dados...");

    const query = `
      SELECT 
        v.id AS voucher_id,
        v.codigo AS voucher_codigo,
        v.desconto AS voucher_desconto,
        p.nome_empresa AS parceiro_nome,
        p.nicho AS parceiro_nicho,
        p.foto AS parceiro_foto
      FROM vouchers v
      INNER JOIN parceiros p ON v.parceiro_id = p.id
    `;

    const result = await pool.query(query);
    
    console.log("🔍 Vouchers encontrados:", result.rows);

    return new Response(JSON.stringify(result.rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Erro ao buscar vouchers:", error);
    return new Response(JSON.stringify({ error: "Erro interno ao buscar vouchers" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
