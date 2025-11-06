/**
 * Seed Contact Settings
 * Populates settings table with all editable contact page fields
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

// Use SERVICE_ROLE_KEY to bypass RLS for seeding
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
)

const contactSettings = [
  // Owner Information
  {
    key: 'contact_owner_name',
    value: 'María González',
    description: 'Nombre del propietario',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_owner_experience',
    value: 'Más de 15 años creando momentos inolvidables con flores',
    description: 'Experiencia del propietario',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_owner_specialty',
    value: 'Arreglos personalizados y flores frescas de temporada',
    description: 'Especialidad del propietario',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_shop_name',
    value: 'FloresYa - Tu Floristería de Confianza',
    description: 'Nombre de la tienda',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_shop_location_text',
    value: 'Nuestro local en Chacao - ¡Te esperamos!',
    description: 'Texto de ubicación del local',
    type: 'string',
    is_public: true
  },

  // Contact Phones
  {
    key: 'contact_phone_primary',
    value: '+58 412-1234567',
    description: 'Teléfono principal',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_phone_secondary',
    value: '+58 212-1234567',
    description: 'Teléfono secundario',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_whatsapp_main',
    value: '+58 412-1234567',
    description: 'WhatsApp principal',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_whatsapp_special',
    value: '+58 412-1234568',
    description: 'WhatsApp para pedidos especiales',
    type: 'string',
    is_public: true
  },

  // Email
  {
    key: 'contact_email_main',
    value: 'contacto@floresya.com',
    description: 'Email principal de contacto',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_email_response_time',
    value: 'Respondemos en menos de 2 horas durante horario laboral',
    description: 'Tiempo de respuesta de email',
    type: 'string',
    is_public: true
  },

  // Location
  {
    key: 'contact_location_main',
    value: 'Gran Caracas, Venezuela',
    description: 'Ubicación principal',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_location_delivery_area',
    value: 'Entregamos en toda el área metropolitana de Caracas',
    description: 'Área de entrega',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_location_coverage',
    value: 'Caracas, Chacao, Baruta, Sucre, El Hatillo',
    description: 'Cobertura de entrega',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_location_address',
    value: 'Av. Principal de Chacao, Centro Comercial Flores, Local 15-B, Caracas, Venezuela',
    description: 'Dirección física completa',
    type: 'string',
    is_public: true
  },

  // Business Hours
  {
    key: 'contact_hours_weekday',
    value: '8:00 AM - 6:00 PM',
    description: 'Horario lunes a viernes',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_hours_saturday',
    value: '9:00 AM - 4:00 PM',
    description: 'Horario sábados',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_hours_sunday',
    value: '10:00 AM - 2:00 PM (Solo WhatsApp)',
    description: 'Horario domingos',
    type: 'string',
    is_public: true
  },
  {
    key: 'contact_delivery_same_day',
    value: '¡Entregas el mismo día hasta las 4:00 PM!',
    description: 'Mensaje de entrega mismo día',
    type: 'string',
    is_public: true
  },

  // Pago Móvil - Banco de Venezuela
  {
    key: 'payment_movil_venezuela_phone',
    value: '0412-1234567',
    description: 'Teléfono pago móvil Banco de Venezuela',
    type: 'string',
    is_public: true
  },
  {
    key: 'payment_movil_venezuela_cedula',
    value: 'V-12345678',
    description: 'Cédula pago móvil Banco de Venezuela',
    type: 'string',
    is_public: true
  },

  // Pago Móvil - Banesco
  {
    key: 'payment_movil_banesco_phone',
    value: '0414-8765432',
    description: 'Teléfono pago móvil Banesco',
    type: 'string',
    is_public: true
  },
  {
    key: 'payment_movil_banesco_cedula',
    value: 'V-12345678',
    description: 'Cédula pago móvil Banesco',
    type: 'string',
    is_public: true
  },

  // Pago Móvil - Mercantil
  {
    key: 'payment_movil_mercantil_phone',
    value: '0424-1122334',
    description: 'Teléfono pago móvil Mercantil',
    type: 'string',
    is_public: true
  },
  {
    key: 'payment_movil_mercantil_cedula',
    value: 'V-12345678',
    description: 'Cédula pago móvil Mercantil',
    type: 'string',
    is_public: true
  },

  // Transferencias - Banco de Venezuela
  {
    key: 'payment_transfer_venezuela_account',
    value: '0102-1234-5678-90123456',
    description: 'Número de cuenta Banco de Venezuela',
    type: 'string',
    is_public: true
  },
  {
    key: 'payment_transfer_venezuela_holder',
    value: 'FloresYa C.A.',
    description: 'Titular cuenta Banco de Venezuela',
    type: 'string',
    is_public: true
  },
  {
    key: 'payment_transfer_venezuela_rif',
    value: 'J-123456789',
    description: 'RIF cuenta Banco de Venezuela',
    type: 'string',
    is_public: true
  },

  // Transferencias - Banesco
  {
    key: 'payment_transfer_banesco_account',
    value: '0134-5678-9012-34567890',
    description: 'Número de cuenta Banesco',
    type: 'string',
    is_public: true
  },
  {
    key: 'payment_transfer_banesco_holder',
    value: 'María González',
    description: 'Titular cuenta Banesco',
    type: 'string',
    is_public: true
  },
  {
    key: 'payment_transfer_banesco_cedula',
    value: 'V-12345678',
    description: 'Cédula titular cuenta Banesco',
    type: 'string',
    is_public: true
  },

  // International Payments
  {
    key: 'payment_zelle_email',
    value: 'pagos@floresya.com',
    description: 'Email para Zelle',
    type: 'string',
    is_public: true
  },
  {
    key: 'payment_zelle_name',
    value: 'María González',
    description: 'Nombre para Zelle',
    type: 'string',
    is_public: true
  },
  {
    key: 'payment_paypal_email',
    value: 'paypal@floresya.com',
    description: 'Email para PayPal',
    type: 'string',
    is_public: true
  },

  // Social Media
  {
    key: 'social_facebook_url',
    value: 'https://facebook.com/floresya',
    description: 'URL de Facebook',
    type: 'string',
    is_public: true
  },
  {
    key: 'social_facebook_handle',
    value: '@floresya',
    description: 'Handle de Facebook',
    type: 'string',
    is_public: true
  },
  {
    key: 'social_instagram_url',
    value: 'https://instagram.com/floresya_ve',
    description: 'URL de Instagram',
    type: 'string',
    is_public: true
  },
  {
    key: 'social_instagram_handle',
    value: '@floresya_ve',
    description: 'Handle de Instagram',
    type: 'string',
    is_public: true
  },
  {
    key: 'social_tiktok_url',
    value: 'https://tiktok.com/@floresya',
    description: 'URL de TikTok',
    type: 'string',
    is_public: true
  },
  {
    key: 'social_tiktok_handle',
    value: '@floresya',
    description: 'Handle de TikTok',
    type: 'string',
    is_public: true
  }
]

async function seedContactSettings() {
  console.log('🌱 Seeding contact settings...')

  for (const setting of contactSettings) {
    try {
      const { data: _data, error } = await supabase
        .from('settings')
        .upsert(setting, { onConflict: 'key' })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error inserting ${setting.key}:`, error.message)
      } else {
        console.log(`✅ ${setting.key}`)
      }
    } catch (error) {
      console.error(`❌ Failed to insert ${setting.key}:`, error.message)
    }
  }

  console.log('\n✨ Contact settings seeding completed!')
  console.log(`📊 Total settings: ${contactSettings.length}`)
}

seedContactSettings()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
