// Mock implementation of uuid for Jest tests
export const v4 = jest.fn(() => '12345678-1234-4567-8901-123456789012')
export const v1 = jest.fn(() => '12345678-1234-1234-1234-123456789012')
export const v3 = jest.fn(() => '12345678-1234-1234-1234-123456789012')
export const v5 = jest.fn(() => '12345678-1234-1234-1234-123456789012')

export default {
  v1,
  v3,
  v4,
  v5
}