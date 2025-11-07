const Home = () => {
  return (
    <section className="mt-10 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-semibold">
          Discover Your Next <span className="text-orange-400">Soundscape</span>
        </h2>
        <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
          Explore live concerts, immersive music events, and unforgettable
          soundscapes. Find tickets, bookmark favorites, and connect with the
          music community.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button className="px-6 py-2 rounded bg-orange-500 hover:bg-orange-400 text-sm md:text-base">
          Start Exploring
        </button>
        <button className="px-6 py-2 rounded border border-gray-600 hover:bg-gray-800 text-sm md:text-base">
          Submit an Event
        </button>
      </div>
    </section>
  )
}

export default Home


