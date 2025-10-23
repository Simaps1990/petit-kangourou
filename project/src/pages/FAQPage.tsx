import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  React.useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order', { ascending: true });
    
    if (data && !error) {
      setFaqs(data);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1ee] to-white py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#c27275] mb-6">
            Questions fréquentes
          </h1>
          <p className="text-xl text-[#c27275]/70 max-w-3xl mx-auto">
            Retrouvez les réponses aux questions les plus courantes sur le portage physiologique
          </p>
        </div>

        {/* FAQ Section */}
        {faqs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {faqs.map((faq) => (
              <div 
                key={faq.id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="font-semibold text-[#c27275] mb-3">{faq.question}</h3>
                <p className="text-[#c27275]/70 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#c27275]/70">Aucune question fréquente configurée pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQPage;
