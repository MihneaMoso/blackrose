import { createClient } from '@/lib/supabase/server'
import MarkdownRenderer from '@/components/MarkdownRenderer'

export default async function AboutPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('pages')
    .select('content')
    .eq('slug', 'about')
    .single()

  const content = data?.content ?? ''

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-5xl mx-auto px-6 py-24">
        {content ? (
          <MarkdownRenderer content={content} />
        ) : (
          <DefaultAboutContent />
        )}
      </div>
    </div>
  )
}

function DefaultAboutContent() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-serif text-rose-200 mb-6 tracking-wide">
          Black Rose
        </h1>
        <p className="text-zinc-400 text-lg font-light">
          Elegance in Shadows — Luxury Floral Design
        </p>
        <div className="h-px w-24 bg-rose-200/30 mx-auto mt-8" />
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-serif text-rose-200 mb-4 tracking-wide">
          Our Story
        </h2>
        <p className="text-zinc-300 leading-relaxed mb-4 text-base md:text-lg font-light">
          Black Rose was born from a fascination with the unconventional. We believe
          that true beauty often lies in the shadows — in the velvety depth of a dark
          petal, the quiet elegance of a monochrome arrangement, the bold statement of
          defying tradition.
        </p>
        <p className="text-zinc-300 leading-relaxed mb-4 text-base md:text-lg font-light">
          Founded in the heart of the city, our studio specializes in crafting
          bespoke floral arrangements that embrace a darker, more sophisticated
          aesthetic. Each creation is designed to evoke emotion, inspire wonder, and
          leave a lasting impression.
        </p>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-serif text-rose-200 mb-4 tracking-wide">
          Our Philosophy
        </h2>
        <p className="text-zinc-300 leading-relaxed mb-4 text-base md:text-lg font-light">
          We source the finest blooms from around the world — rare black baccara
          roses, deep burgundy calla lilies, midnight-blue delphiniums, and
          charcoal-hued succulents. Every arrangement is handcrafted with meticulous
          attention to detail, ensuring each piece tells its own story.
        </p>
        <p className="text-zinc-300 leading-relaxed text-base md:text-lg font-light">
          Sustainability is at our core. We work with local growers who practice
          ethical farming, and we use eco-friendly packaging in all our deliveries.
        </p>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-serif text-rose-200 mb-4 tracking-wide">
          Why Choose Us
        </h2>
        <ul className="space-y-3 text-zinc-300 font-light">
          <li className="flex items-start gap-3">
            <span className="text-rose-200 mt-1">✦</span>
            <span>Handcrafted luxury arrangements for every occasion</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-rose-200 mt-1">✦</span>
            <span>Rare and exotic blooms not found in traditional florists</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-rose-200 mt-1">✦</span>
            <span>Personalized consultations for bespoke designs</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-rose-200 mt-1">✦</span>
            <span>Reliable same-day delivery within the city</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-rose-200 mt-1">✦</span>
            <span>Eco-friendly practices from farm to doorstep</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl md:text-3xl font-serif text-rose-200 mb-4 tracking-wide">
          Visit Our Studio
        </h2>
        <p className="text-zinc-300 leading-relaxed mb-4 text-base md:text-lg font-light">
          We invite you to experience the artistry of Black Rose in person. Our
          studio is open by appointment, offering private consultations where we
          bring your vision to life.
        </p>
        <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 mt-6">
          <p className="text-zinc-300 font-light">
            <span className="text-rose-200 font-medium">Address:</span> 127 Shadow Lane, Suite B
          </p>
          <p className="text-zinc-300 font-light mt-2">
            <span className="text-rose-200 font-medium">Email:</span> hello@blackroses.com
          </p>
          <p className="text-zinc-300 font-light mt-2">
            <span className="text-rose-200 font-medium">Phone:</span> (555) 123-4567
          </p>
        </div>
      </section>
    </div>
  )
}
