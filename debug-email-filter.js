/**
 * Debug email verification filter issue
 */

/* eslint-disable no-restricted-globals */
const API_BASE = 'http://localhost:3000'

async function debugEmailFilter() {
  console.log('🔍 Debugging Email Verification Filter...\n')

  try {
    // Test basic users endpoint
    console.log('1. Getting all users...')
    const allResponse = await fetch(`${API_BASE}/api/users`)
    const allData = await allResponse.json()

    if (allData.success && allData.data) {
      console.log(`✅ Found ${allData.data.length} users`)

      // Show all users with their email verification status
      console.log('\n2. User details:')
      allData.data.forEach(user => {
        console.log(`   ID ${user.id}: ${user.email} - Verified: ${user.email_verified}`)
      })

      // Test email verification filter
      console.log('\n3. Testing email_verified=true filter...')
      const verifiedResponse = await fetch(`${API_BASE}/api/users?email_verified=true`)
      console.log(`   Status: ${verifiedResponse.status}`)

      const verifiedText = await verifiedResponse.text()
      console.log(`   Response: ${verifiedText.substring(0, 200)}...`)

      if (verifiedResponse.ok) {
        try {
          const verifiedData = JSON.parse(verifiedText)
          console.log(`   ✅ Filter successful: ${verifiedData.data?.length || 0} verified users`)
        } catch (_e) {
          console.log(`   ❌ Invalid JSON response`)
        }
      } else {
        console.log(`   ❌ HTTP Error: ${verifiedResponse.status}`)
      }

      // Test email_verified=false filter
      console.log('\n4. Testing email_verified=false filter...')
      const unverifiedResponse = await fetch(`${API_BASE}/api/users?email_verified=false`)
      console.log(`   Status: ${unverifiedResponse.status}`)

      const unverifiedText = await unverifiedResponse.text()
      console.log(`   Response: ${unverifiedText.substring(0, 200)}...`)

      if (unverifiedResponse.ok) {
        try {
          const unverifiedData = JSON.parse(unverifiedText)
          console.log(
            `   ✅ Filter successful: ${unverifiedData.data?.length || 0} unverified users`
          )
        } catch (_e) {
          console.log(`   ❌ Invalid JSON response`)
        }
      } else {
        console.log(`   ❌ HTTP Error: ${unverifiedResponse.status}`)
      }

      // Test with boolean value directly
      console.log('\n5. Testing with boolean parameters...')

      const testParams = [
        'email_verified=true',
        'email_verified=false',
        'email_verified=1',
        'email_verified=0'
      ]

      for (const param of testParams) {
        console.log(`\n   Testing: ${param}`)
        const testResponse = await fetch(`${API_BASE}/api/users?${param}`)
        console.log(`   Status: ${testResponse.status}`)

        if (testResponse.ok) {
          const testData = await testResponse.json()
          console.log(`   Results: ${testData.data?.length || 0} users`)
        } else {
          const errorText = await testResponse.text()
          console.log(`   Error: ${errorText.substring(0, 100)}...`)
        }
      }
    } else {
      console.log('❌ Could not get users data')
    }
  } catch (error) {
    console.error('❌ Debug failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

debugEmailFilter()
