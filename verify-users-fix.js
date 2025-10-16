/**
 * Verification script for users page fixes
 */

/* eslint-disable no-restricted-globals */
const API_BASE = 'http://localhost:3000'

async function verifyUsersFix() {
  console.log('🔍 Verifying Users Page Fixes...\n')

  try {
    // Test 1: Check API still works
    console.log('1. Testing API connectivity...')
    const response = await fetch(`${API_BASE}/api/users`)
    const data = await response.json()

    if (data.success && data.data) {
      console.log(`✅ API working: ${data.data.length} users found`)
    } else {
      throw new Error('API not working')
    }

    // Test 2: Check admin user protection
    console.log('\n2. Testing admin user protection...')
    const adminResponse = await fetch(`${API_BASE}/api/users?role=admin`)
    const adminData = await adminResponse.json()

    if (adminData.success && adminData.data?.length > 0) {
      const admin = adminData.data[0]
      console.log(`✅ Admin user found: ID ${admin.id}, Email: ${admin.email}`)

      if (admin.id === 3) {
        console.log('✅ Admin user has correct ID (3) for protection')
      } else {
        console.log(`⚠️ Admin user has ID ${admin.id}, but protection is set for ID 3`)
      }
    } else {
      console.log('❌ No admin user found')
    }

    // Test 3: Check filters work
    console.log('\n3. Testing filters...')

    const filters = [
      { name: 'Role admin', query: '?role=admin' },
      { name: 'Role user', query: '?role=user' },
      { name: 'Email verified', query: '?email_verified=true' },
      { name: 'Email unverified', query: '?email_verified=false' },
      { name: 'Search test', query: '?search=admin' }
    ]

    for (const filter of filters) {
      const filterResponse = await fetch(`${API_BASE}/api/users${filter.query}`)
      const filterData = await filterResponse.json()

      if (filterData.success) {
        console.log(`✅ ${filter.name}: ${filterData.data?.length || 0} results`)
      } else {
        console.log(`❌ ${filter.name}: Failed`)
      }
    }

    // Test 4: Check user details
    console.log('\n4. Testing user details...')

    if (data.data?.length > 0) {
      const firstUser = data.data[0]
      const userResponse = await fetch(`${API_BASE}/api/users/${firstUser.id}`)
      const userData = await userResponse.json()

      if (userData.success) {
        console.log(`✅ User details work for ID ${firstUser.id}`)
        console.log(`   Email: ${userData.data.email}`)
        console.log(`   Role: ${userData.data.role}`)
        console.log(`   Active: ${userData.data.is_active}`)
        console.log(`   Email Verified: ${userData.data.email_verified}`)
      } else {
        console.log(`❌ User details failed for ID ${firstUser.id}`)
      }
    }

    console.log('\n✅ All API verifications completed!')
    console.log('\n📝 Manual Testing Steps:')
    console.log('1. Open http://localhost:3000/admin/dashboard.html')
    console.log('2. Click "Usuarios" in sidebar')
    console.log('3. Verify table shows users')
    console.log('4. Test filters (role, status, email verification)')
    console.log('5. Test search functionality')
    console.log('6. Verify admin user (ID 3) is protected')
    console.log('7. Test create user modal')
    console.log('8. Test responsive design on mobile')
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message)
  }
}

verifyUsersFix()
