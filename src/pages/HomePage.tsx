
import { Link } from 'react-router-dom';

const btnPrimary =
  'relative flex justify-center items-center rounded bg-[var(--light-blue)] font-sans shadow-[0px_6px_24px_0px_rgba(0,0,0,0.2)] overflow-hidden cursor-pointer border-none group no-underline';
const btnInner =
  'absolute inset-0 w-0 h-full bg-[var(--orange)] transition-all duration-300 ease-in-out right-0 group-hover:left-0 group-hover:w-full';
const btnText = 'relative z-20 py-4 px-5 text-white text-[1.7em] font-bold tracking-wider';

export function HomePage() {
  return (
    <section
      className="min-h-[calc(100vh-var(--navbar-height))] bg-[var(--dark)] flex flex-col justify-center text-white relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/new-bg-final.png')" }}
    >
      <div className="flex flex-col items-start text-left px-10 md:px-14 lg:px-20">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/generate-schedules" className={btnPrimary}>
            <span className={btnInner} />
            <span className={btnText}>Generate Schedule</span>
          </Link>
          <Link to="/find-study-rooms" className={btnPrimary}>
            <span className={btnInner} />
            <span className={btnText}>Find Study Rooms</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

