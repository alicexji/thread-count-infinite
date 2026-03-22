import { removeBackground as imglyRemoveBackground, Config } from '@imgly/background-removal';

export async function removeBackground(imageSource: string | URL | Request | HTMLImageElement | HTMLCanvasElement | Blob | ArrayBuffer | Uint8Array): Promise<string> {
  const config: Config = {
    output: {
      format: 'image/png',
      quality: 0.8,
    },
    debug: false,
    device: 'cpu', // Use CPU for better compatibility in sandboxed environments if needed, but 'gpu' is faster if available
  };

  try {
    const blob = await imglyRemoveBackground(imageSource, config);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Background removal failed:', error);
    // Fallback to original image if removal fails
    if (typeof imageSource === 'string') return imageSource;
    return '';
  }
}
