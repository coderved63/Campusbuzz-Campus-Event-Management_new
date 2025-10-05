import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  data: string | object;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
  alt?: string;
  includeMargin?: boolean;
  darkColor?: string;
  lightColor?: string;
  renderAs?: 'canvas' | 'svg';
}

const QRCodeComponent: React.FC<QRCodeComponentProps> = ({
  data,
  size = 200,
  level = 'H',
  className = '',
  alt = 'QR Code',
  includeMargin = true,
  darkColor = '#1f2937',
  lightColor = '#ffffff',
  renderAs = 'canvas'
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setLoading(true);
        setError('');

        // Convert data to string if it's an object
        const qrString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);

        const options = {
          errorCorrectionLevel: level,
          margin: includeMargin ? 2 : 0,
          width: size,
          color: {
            dark: darkColor,
            light: lightColor
          }
        };

        if (renderAs === 'svg') {
          const svgString = await QRCode.toString(qrString, {
            ...options,
            type: 'svg'
          });
          
          // Convert SVG to data URL
          const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
          setQrCodeUrl(svgDataUrl);
        } else {
          // Generate as data URL (canvas-based)
          const dataUrl = await QRCode.toDataURL(qrString, options);
          setQrCodeUrl(dataUrl);
        }
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    if (data) {
      generateQRCode();
    }
  }, [data, size, level, includeMargin, darkColor, lightColor, renderAs]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`} style={{ width: size, height: size }}>
        <span className="text-gray-500 text-sm">Error loading QR</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <img 
        src={qrCodeUrl} 
        alt={alt}
        style={{ width: size, height: size }}
        className="object-contain"
      />
    </div>
  );
};

export default QRCodeComponent;