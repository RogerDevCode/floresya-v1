/**
 * Direct API test for users functionality
 */

const API_BASE = 'http://localhost:3000'

async function testUsersAPI() {
  console.log('🔍 Testing Users API directly...\n')

  try {
    // Test 1: Get all users
    console.log('1. Testing GET /api/users...')
    const response = await fetch(`${API_BASE}/api/users`)
    console.log(`   Status: ${response.status}`)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`   Success: ${data.success}`)
    console.log(`   Users count: ${data.data?.length || 0}`)

    if (data.success && data.data?.length > 0) {
      const firstUser = data.data[0]
      console.log(`   First user:`, {
        id: firstUser.id,
        email: firstUser.email,
        role: firstUser.role,
        is_active: firstUser.is_active,
        email_verified: firstUser.email_verified
      })
    }

    // Test 2: Filter by role
    console.log('\n2. Testing GET /api/users?role=admin...')
    const adminRoleResponse = await fetch(`${API_BASE}/api/users?role=admin`)
    const adminRoleData = await adminRoleResponse.json()
    console.log(`   Admin users: ${adminRoleData.data?.length || 0}`)

    // Test 3: Filter by email verification
    console.log('\n3. Testing GET /api/users?email_verified=true...')
    const verifiedResponse = await fetch(`${API_BASE}/api/users?email_verified=true`)
    const verifiedData = await verifiedResponse.json()
    console.log(`   Verified users: ${verifiedData.data?.length || 0}`)

    // Test 4: Search functionality
    console.log('\n4. Testing GET /api/users?search=test...')
    const searchResponse = await fetch(`${API_BASE}/api/users?search=test`)
    const searchData = await searchResponse.json()
    console.log(`   Search results: ${searchData.data?.length || 0}`)

    // Test 5: Combined filters
    console.log('\n5. Testing GET /api/users?role=user&email_verified=true...')
    const combinedResponse = await fetch(`${API_BASE}/api/users?role=user&email_verified=true`)
    const combinedData = await combinedResponse.json()
    console.log(`   Combined results: ${combinedData.data?.length || 0}`)

    // Test 6: Find admin user and check details
    console.log('\n6. Finding admin user details...')
    const adminResponse = await fetch(`${API_BASE}/api/users?role=admin`)
    const adminData = await adminResponse.json()

    if (adminData.success && adminData.data?.length > 0) {
      const adminUser = adminData.data[0]
      console.log(`   Admin user found:`, {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        is_active: adminUser.is_active,
        email_verified: adminUser.email_verified
      })

      // Test admin user endpoint
      console.log(`\n6b. Testing GET /api/users/${adminUser.id}...`)
      const adminDetailResponse = await fetch(`${API_BASE}/api/users/${adminUser.id}`)
      if (adminDetailResponse.ok) {
        const adminDetailData = await adminDetailResponse.json()
        console.log(`   Admin details: ${JSON.stringify(adminDetailData.data, null, 2)}`)
      }
    } else {
      console.log('   No admin users found!')
    }

    console.log('\n✅ API tests completed successfully!')
  } catch (error) {
    console.error('\n❌ API test failed:', error.message)
    console.error('Stack:', error.stack)
  }
}

testUsersAPI()
