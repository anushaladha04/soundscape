import { useNavigate } from 'react-router-dom'

const PublicHome = () => {
  const navigate = useNavigate()

  return (
    <section className="mt-10 pb-10">
      <div className="text-center space-y-4">
        <h2 className="mt-20 text-6xl md:text-6xl font-semibold mb-10">
          Discover Your Next
          <br />
          <span className="text-[#f26f5e]">Soundscape</span>
        </h2>
        <p className="text-md md:text-base text-gray-300 max-w-xl mx-auto">
          Explore live concerts, immersive music events, and unforgettable
          soundscapes within the Los Angeles area. Find events, bookmark favorites, and connect with the
          music community.
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="px-4 py-2 rounded lg:px-4 lg:py-1.5 bg-[#f26f5e] hover:bg-[#ff8270] text-sm md:text-base lg:text-sm"
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-4 py-2 rounded lg:px-4 lg:py-1.5 border border-gray-600 hover:bg-gray-800 text-sm md:text-base lg:text-sm"
        >
          Log In
        </button>
      </div>

      <div className="mt-32 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h3 className="text-lg md:text-xl font-semibold">
            Why join Soundscape?
          </h3>
          <p className="text-sm text-neutral-400">
            Build your live‑music calendar in seconds and let us surface the
            events you actually care about.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 text-sm">
          <div className="rounded-2xl border border-[#1c1c1c] bg-[#090909] px-4 py-5 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              01 • Personalized
            </p>
            <h4 className="font-semibold">Taste‑Based Feed</h4>
            <p className="text-xs text-neutral-400">
              Tell us your favorite genres and we&apos;ll curate concerts,
              festivals, and immersive events that match your vibe.
            </p>
          </div>
          <div className="rounded-2xl border border-[#1c1c1c] bg-[#090909] px-4 py-5 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              02 • Organized
            </p>
            <h4 className="font-semibold">Save &amp; Bookmark</h4>
            <p className="text-xs text-neutral-400">
              Keep track of shows you don&apos;t want to miss and build your
              own watchlist of upcoming nights out.
            </p>
          </div>
          <div className="rounded-2xl border border-[#1c1c1c] bg-[#090909] px-4 py-5 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              03 • Social
            </p>
            <h4 className="font-semibold">Your Community</h4>
            <p className="text-xs text-neutral-400">
              Learn about local artists, underground venues, and pop-up 
              experiences in your area through the Soundscape community.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PublicHome


