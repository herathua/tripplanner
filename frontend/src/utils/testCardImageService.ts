import CardImageService from './cardImageService';

/**
 * Test the CardImageService functionality
 * Run this in your browser console to test the service
 */
export const testCardImageService = async () => {
  console.log('🧪 Testing CardImageService...');
  
  try {
    // Test 1: Get trip card image for Tokyo
    console.log('📍 Testing Tokyo trip image...');
    const tokyoImage = await CardImageService.getTripCardImage('Tokyo', 'city');
    console.log('✅ Tokyo image:', tokyoImage);
    
    // Test 2: Get guide card image for Paris
    console.log('🗺️ Testing Paris guide image...');
    const parisImage = await CardImageService.getGuideCardImage('Paris', 'culture');
    console.log('✅ Paris guide image:', parisImage);
    
    // Test 3: Get seasonal image for Kyoto
    console.log('🌸 Testing Kyoto seasonal image...');
    const kyotoImage = await CardImageService.getSeasonalImage('Kyoto');
    console.log('✅ Kyoto seasonal image:', kyotoImage);
    
    // Test 4: Get multiple images for Venice
    console.log('🚣 Testing Venice gallery...');
    const veniceImages = await CardImageService.getDestinationGallery('Venice', 3);
    console.log('✅ Venice gallery:', veniceImages);
    
    console.log('🎉 All tests completed successfully!');
    return {
      tokyo: tokyoImage,
      paris: parisImage,
      kyoto: kyotoImage,
      venice: veniceImages
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

// Export for use in browser console
(window as any).testCardImageService = testCardImageService;
