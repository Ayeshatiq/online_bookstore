import { StarIcon } from "@/lib/icons";

interface Testimonial {
  id: number;
  text: string;
  name: string;
  initials: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    text: "BookHaven has completely transformed how I discover new books. Their recommendations are spot on, and delivery is always prompt!",
    name: "Sara M.",
    initials: "SM",
    rating: 5,
  },
  {
    id: 2,
    text: "As an avid reader, I've tried many online bookstores, but BookHaven stands out for their extensive collection and user-friendly website.",
    name: "James T.",
    initials: "JT",
    rating: 4.5,
  },
  {
    id: 3,
    text: "The customer service at BookHaven is exceptional. When my order had an issue, they resolved it immediately and even gave me a discount on my next purchase!",
    name: "Lisa P.",
    initials: "LP",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={`full-${i}`} className="text-secondary-500" />);
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="text-secondary-500" />);
    }

    return stars;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-title font-bold text-primary-800 mb-2 text-center">
          What Our Readers Say
        </h2>
        <p className="text-primary-600 text-center mb-8 max-w-2xl mx-auto">
          Join thousands of happy readers who have found their next favorite books through BookHaven.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-primary-50 p-6 rounded-lg relative">
              <div className="text-secondary-400 absolute -top-2 -left-2 text-4xl">"</div>
              <p className="text-primary-700 mb-4 z-10 relative">{testimonial.text}</p>
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
                    {testimonial.initials}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-primary-800">{testimonial.name}</h4>
                  <div className="flex text-secondary-500">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
