// Test script to create a company with all fields and dummy images
// Run this in browser console after clearing images

const COMPANIES_KEY = 'zxs-companies';

// Create a dummy image data URL (small 1x1 pixel image)
function createDummyImage(color = '#4CAF50') {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 200, 200);
  ctx.fillStyle = '#fff';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Dummy Image', 100, 100);
  return canvas.toDataURL('image/jpeg', 0.7);
}

// Create test company
function createTestCompany() {
  const companies = JSON.parse(localStorage.getItem(COMPANIES_KEY) || '[]');
  
  const testCompany = {
    id: crypto.randomUUID(),
    name: '測試公司 Test Company',
    address: '香港九龍尖沙咀測試街道123號 Test Address, Hong Kong',
    description: '這是一個測試公司的描述。This is a test company description with all fields filled.',
    phone: '+852 1234 5678',
    website: 'https://test-company.example.com',
    notes: '這是測試備註。This is a test note.',
    media: [
      {
        id: crypto.randomUUID(),
        name: '主圖-main-image.jpg',
        dataUrl: createDummyImage('#4CAF50'),
        isMain: true
      }
    ],
    gallery: [
      {
        id: crypto.randomUUID(),
        name: 'gallery-1.jpg',
        dataUrl: createDummyImage('#2196F3')
      },
      {
        id: crypto.randomUUID(),
        name: 'gallery-2.jpg',
        dataUrl: createDummyImage('#FF9800')
      },
      {
        id: crypto.randomUUID(),
        name: 'gallery-3.jpg',
        dataUrl: createDummyImage('#9C27B0')
      }
    ],
    relatedUserIds: [], // Will be set based on current user
    ownerEmail: 'admin@zxsgit.local',
    ownerName: 'Admin',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  companies.push(testCompany);
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies));
  
  console.log('✅ Test company created:', testCompany);
  console.log('Company ID:', testCompany.id);
  console.log('Total companies:', companies.length);
  
  // Dispatch update event
  window.dispatchEvent(new Event('companies:update'));
  
  return testCompany;
}

// Usage:
// 1. Open browser console (F12)
// 2. Copy and paste this entire file
// 3. Run: createTestCompany()
// 4. Navigate to /companies to see the new company

console.log('Test company creation script loaded!');
console.log('Run: createTestCompany() to create a test company with all fields and dummy images');
