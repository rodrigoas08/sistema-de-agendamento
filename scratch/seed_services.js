const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

const shops = [
  "a436e7b7-4dd1-44b7-abb5-a18db5402a77", // Barbearia Teste2
  "79c00c85-9480-40b9-bdd3-b1eebecbdf68"  // Barbearia teste
];

const services = [
  { name: "Corte de Cabelo", duration: "30 min", price: "50", icon: "✂️", active: true },
  { name: "Barba", duration: "20 min", price: "35", icon: "🧔", active: true },
  { name: "Corte & Barba", duration: "50 min", price: "75", icon: "✨", active: true },
  { name: "Sobrancelha", duration: "15 min", price: "20", icon: "👁️", active: true },
  { name: "Pezinho", duration: "10 min", price: "15", icon: "📏", active: true }
];

async function seedServices() {
  console.log("Iniciando cadastro de serviços...");
  
  for (const shopId of shops) {
    console.log(`Cadastrando para o estabelecimento: ${shopId}`);
    
    const servicesWithShop = services.map(s => ({
      ...s,
      barbershop_id: shopId
    }));

    const { data, error } = await supabase
      .from('services')
      .insert(servicesWithShop);

    if (error) {
      console.error(`Erro ao cadastrar serviços para ${shopId}:`, error.message);
    } else {
      console.log(`Serviços cadastrados com sucesso para ${shopId}`);
    }
  }
}

seedServices();
