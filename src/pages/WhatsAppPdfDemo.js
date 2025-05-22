import { useState } from 'react';
import { MessageCircle, CheckCircle, Printer } from 'lucide-react';

export default function WhatsAppPdfDemo() {
  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState("");

  // Simulate PDF generation and WhatsApp sending
  const handleSendPdf = () => {
    setSending(true);
    setMessage("");
    
    // Simulate processing time
    setTimeout(() => {
      setSending(false);
      setComplete(true);
      setMessage("PDF invoice 'Invoice_INV-2023-001_ABO-123.pdf' has been generated and downloaded. WhatsApp message has been prepared for John Smith. Please attach the downloaded PDF to your WhatsApp message.");
    }, 1500);
  };
  
  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="p-6 bg-slate-50 rounded-lg shadow">
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-blue-800 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-2">
            Your payment has been processed successfully and the receipt has been generated.
          </p>
          <p className="font-medium">
            Invoice #INV-2023-001 | Amount: ₹4,697
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
          <button 
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow"
          >
            <Printer size={20} /> Print Bill
          </button>
          
          <button
            className={`flex items-center justify-center gap-2 ${sending ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white py-2 px-4 rounded shadow`}
            onClick={handleSendPdf}
            disabled={sending}
          >
            {sending ? (
              <>
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <MessageCircle size={20} /> Send PDF via WhatsApp
              </>
            )}
          </button>
        </div>
        
        {complete && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}