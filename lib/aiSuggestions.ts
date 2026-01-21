export async function getFieldSuggestions(fieldName: string): Promise<string[]> {
  const field = fieldName.toLowerCase();
  
  const suggestions: Record<string, string[]> = {
    name: [
      'Rajesh Kumar',
      'Priya Sharma',
      'Amit Patel',
      'Sneha Reddy',
      'Vikram Singh'
    ],
    phone: [
      '9876543210',
      '8765432109',
      '7654321098',
      '9123456789',
      '8234567890'
    ],
    contact: [
      '9876543210',
      '8765432109',
      '7654321098'
    ],
    email: [
      'example@gmail.com',
      'contact@company.com',
      'info@business.in'
    ],
    address: [
      '123 MG Road, Bangalore',
      '456 Park Street, Mumbai',
      '789 Mall Road, Delhi'
    ],
    date: [
      new Date().toLocaleDateString('en-IN'),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')
    ],
    time: [
      '10:00 AM',
      '2:00 PM',
      '6:00 PM'
    ],
    venue: [
      'Hotel Taj, MG Road',
      'Community Hall, Sector 5',
      'Garden Lawn, City Center'
    ]
  };

  // Try to match field name
  for (const [key, values] of Object.entries(suggestions)) {
    if (field.includes(key)) {
      return values;
    }
  }

  // Default suggestions
  return ['Sample 1', 'Sample 2', 'Sample 3'];
}
