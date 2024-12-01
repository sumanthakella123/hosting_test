// components/Alert.tsx

interface AlertProps {
    message: string;
    variant?: 'success' | 'error' | 'info' | 'destructive'; // Added 'destructive'
  }
  
  export default function Alert({ message, variant = 'info' }: AlertProps) {
    let bgColor;
  
    switch (variant) {
      case 'success':
        bgColor = 'bg-green-100 text-green-800 border-green-400';
        break;
      case 'error':
      case 'destructive': // Treat "destructive" as an error
        bgColor = 'bg-red-100 text-red-800 border-red-400';
        break;
      case 'info':
      default:
        bgColor = 'bg-blue-100 text-blue-800 border-blue-400';
        break;
    }
  
    return (
      <div className={`p-4 border-l-4 ${bgColor} rounded mb-4`}>
        <p>{message}</p>
      </div>
    );
  }
  