import Link from "next/link";
import { Sky, TopBar } from "@/variants/shared/Shell";

const variants = [
  { href: "/a", code: "A", name: "Terminal objects", desc: "Your window, board, carousel, seat map and boarding pass, curated into five pinned scenes." },
  { href: "/b", code: "B", name: "One window", desc: "The arched window stays on screen the whole way; the view outside changes with each stop. Everything else is type." },
  { href: "/c", code: "C", name: "Moving walkway", desc: "The terminal laid out sideways. Scrolling walks you along it, past each stop." },
];

export default function IndexPage() {
  return (
    <>
      <Sky />
      <TopBar here="Choose a variant" />
      <main className="vindex">
        <div>
          <p className="kicker" style={{ marginBottom: 10 }}>Preview branch</p>
          <h1>Three ways through the terminal.</h1>
          <p style={{ marginTop: 10 }}>Same type, palette and content on each. Pick one; the others get deleted.</p>
        </div>
        <ul>
          {variants.map((v) => (
            <li key={v.href}>
              <Link href={v.href}>
                <b>{v.code}</b>
                <span>
                  {v.name}
                  <small>{v.desc}</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
