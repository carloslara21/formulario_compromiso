// Script para validar el archivo .env
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

console.log('🔍 Validando archivo .env...\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ Error: No se encontró el archivo .env');
  console.log('💡 Asegúrate de que el archivo existe en la raíz del proyecto\n');
  process.exit(1);
}

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() !== '' && !line.trim().startsWith('#'));
  
  console.log(`📄 Archivo encontrado (${lines.length} líneas con contenido):\n`);
  
  let hasVITE_API_URL = false;
  let hasVITE_API_KEY = false;
  let errors = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Ignorar comentarios
    if (trimmed.startsWith('#')) {
      return;
    }
    
    if (trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const keyTrim = key.trim();
      const valueTrim = valueParts.join('=').trim();
      
      // Validar formato
      if (keyTrim.startsWith('VITE_')) {
        if (valueTrim.startsWith('"') || valueTrim.startsWith("'")) {
          errors.push(`❌ Línea ${index + 1}: No uses comillas en los valores (${keyTrim})`);
        }
        if (keyTrim.includes(' ') || valueTrim.includes(' =')) {
          errors.push(`❌ Línea ${index + 1}: No dejes espacios alrededor del = (${keyTrim})`);
        }
      }
      
      if (keyTrim === 'VITE_API_URL') {
        hasVITE_API_URL = true;
        console.log(`✅ VITE_API_URL encontrado: ${valueTrim || '(vacío - OK si no usas servidor)'}`);
      } else if (keyTrim === 'VITE_API_KEY') {
        hasVITE_API_KEY = true;
        console.log(`✅ VITE_API_KEY encontrado: ${valueTrim ? '***' + valueTrim.slice(-4) : '(vacío - OK si no necesitas autenticación)'}`);
      } else if (keyTrim.startsWith('VITE_')) {
        console.log(`ℹ️  Variable encontrada: ${keyTrim}`);
      }
    } else if (trimmed !== '') {
      errors.push(`⚠️  Línea ${index + 1}: Formato desconocido - "${trimmed}"`);
    }
  });
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (errors.length > 0) {
    console.log('❌ Errores encontrados:\n');
    errors.forEach(error => console.log(error));
    console.log('\n');
  } else {
    console.log('✅ No se encontraron errores de formato\n');
  }
  
  // Resumen
  console.log('📋 Resumen:');
  console.log(`   - VITE_API_URL: ${hasVITE_API_URL ? '✅ Configurado' : '⚠️  No encontrado (la app funcionará solo con localStorage)'}`);
  console.log(`   - VITE_API_KEY: ${hasVITE_API_KEY ? '✅ Configurado' : '⚠️  No encontrado (opcional)'}`);
  
  if (!hasVITE_API_URL || (hasVITE_API_URL && fs.readFileSync(envPath, 'utf8').includes('VITE_API_URL=') && fs.readFileSync(envPath, 'utf8').match(/VITE_API_URL=\s*$/))) {
    console.log('\n💡 Nota: Si VITE_API_URL está vacío, la app usará solo localStorage (esto está bien)');
  }
  
  console.log('\n✅ Validación completada!\n');
  
} catch (error) {
  console.error('❌ Error al leer el archivo .env:', error.message);
  process.exit(1);
}

