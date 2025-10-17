import { useState, useEffect } from 'react';
import { ArrowRight, BookOpen, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  readTime: string;
  published: boolean;
  createdAt: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  duration: string;
  icon: string;
}

const testimonials = [
  {
    name: "Sophie M.",
    text: "Un accompagnement exceptionnel ! Paola m'a aidée à créer un lien magique avec mon bébé grâce au portage.",
    rating: 5,
    location: "Versailles"
  },
  {
    name: "Marie L.",
    text: "Très professionnelle et à l'écoute. Les conseils sont précieux et adaptés à chaque situation.",
    rating: 5,
    location: "Le Chesnay"
  },
  {
    name: "Julie R.",
    text: "Je recommande vivement ! Mon bébé est plus calme et nous avons gagné en complicité.",
    rating: 5,
    location: "Saint-Germain"
  }
];

function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    loadBlogPosts();
    loadServices();
    
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      // Mapper les noms de colonnes de Supabase vers l'interface TypeScript
      const posts = data.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        date: post.date,
        readTime: post.read_time,
        published: post.published,
        createdAt: post.created_at
      }));
      setBlogPosts(posts);
    }
  };

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: true });
    
    if (data && !error) {
      setServices(data);
    }
  };


  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#c27275]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                Petit
                <span className="block text-white">Kangourou</span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Monitrice certifiée en portage physiologique à Versailles.
                <br />
                Porter votre bébé, c'est lui offrir sécurité, douceur et proximité.
                <br />
                Je vous accompagne pour créer ce lien unique dans le respect de sa physiologie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/reservation"
                  className="px-8 py-4 bg-[#fff1ee] text-[#c27275] rounded-full font-semibold hover:bg-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
                >
                  Réserver un atelier
                </a>
              </div>
            </div>
            <div className="relative animate-float">
              <div className="w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-1 transition-transform duration-500">
                <img 
                  src="/paola.jpg" 
                  alt="Portage bébé" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#c27275]/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#c27275]/20 rounded-full blur-2xl"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#c27275]/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
        
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#c27275] mb-6">
              Mes accompagnements
            </h2>
            <p className="text-xl text-[#c27275]/70 max-w-3xl mx-auto">
            Apprenez à porter votre bébé en toute confiance grâce à des séances adaptées à vos besoins, à votre rythme, et à celui de votre enfant.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {services.map((service, index) => {
              return (
                <div 
                  key={service.id}
                  className="group bg-gradient-to-br from-[#fff1ee] to-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-[#c27275] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <img src={`/${service.icon}`} alt={service.title} className="h-6 w-6 brightness-0 invert" />
                      </div>
                      <h3 className="text-xl font-bold text-[#c27275]">{service.title}</h3>
                    </div>
                    <p className="text-[#c27275]/70 mb-4">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Professional Quote Section */}
      <section className="py-20 bg-[#c27275] text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Devis pour les professionnels
            </h2>
            <div className="text-lg leading-relaxed space-y-4 text-white/90">
              <p>
                Vous êtes professionnel de la petite enfance (assistante maternelle, crèche, PMI, auxiliaire de puériculture…) <br/> et souhaitez vous former au portage physiologique ?
              </p>
              <p>
                Je propose des formations et ateliers sur mesure, adaptés aux besoins de votre structure et de votre équipe.
              </p>
              <p>
Contactez-moi pour obtenir un devis sur-mesure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-[#fff1ee] to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#c27275] mb-12">
            Témoignages de parents
          </h2>
          
          <div className="relative h-48 overflow-hidden">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentTestimonial ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
                }`}
              >
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-[#c27275] fill-current" />
                    ))}
                  </div>
                  <p className="text-lg text-[#c27275] mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="text-[#c27275] font-semibold">
                    {testimonial.name} - {testimonial.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentTestimonial ? 'bg-[#c27275] scale-125' : 'bg-[#c27275]/30'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#c27275] mb-6">
            Autour du portage
            </h2>
            <p className="text-xl text-[#c27275]/70">
            Des astuces pour porter votre bébé en toute sérénité et nourrir votre parentalité avec confiance et bienveillance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article 
                key={post.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setSelectedPost(post)}
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#c27275] mb-3 group-hover:text-[#c27275] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[#c27275]/70 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-[#c27275] font-semibold group-hover:gap-2 transition-all duration-300">
                    Lire la suite
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:ml-2 transition-all duration-300" />
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {blogPosts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-[#c27275]/30 mx-auto mb-4" />
              <p className="text-[#c27275]/70">Aucun article publié pour le moment</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#c27275] to-[#c27275] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Prête à vivre votre première expérience de portage ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
          Réservez votre séance d’accompagnement et découvrez tous les bienfaits du portage physiologique, pour vous et votre bébé.
          </p>
          <a 
            href="/reservation"
            className="inline-block px-10 py-4 bg-white text-[#c27275] rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Réserver maintenant
          </a>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </section>
      
      {/* Blog Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-[#c27275] hover:text-[#c27275] transition-colors shadow-lg"
              >
                ×
              </button>
              <div className="h-64 overflow-hidden rounded-t-2xl">
                <img 
                  src={selectedPost.image} 
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="p-8">
              <h1 className="text-3xl font-bold text-[#c27275] mb-4">{selectedPost.title}</h1>
              <div className="prose prose-lg max-w-none text-[#c27275]/80 leading-relaxed">
                {selectedPost.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;