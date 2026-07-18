import Link from "next/link";

import HeroNetworkCanvas from "@/components/HeroNetworkCanvas";
import MatchScoreCard from "@/components/MatchScoreCard";
import Logo from "@/components/Logo";
import { getDb } from "@/lib/db";
import { getOrCreatePlatformSettings } from "@/lib/platform-settings";
import styles from "./warm.module.css";

export default async function Home() {
  const settings = await getOrCreatePlatformSettings(getDb());

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navI}>
          <Logo logoKey={settings.logoKey} />
          <ul className={styles.navLinks}>
            <li>
              <a href="#how-it-works">How it works</a>
            </li>
            <li>
              <a href="#for-suppliers">For Suppliers</a>
            </li>
            <li>
              <a href="#for-buyers">For Buyers</a>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
          </ul>
          <div className={styles.navA}>
            <Link href="/sign-in" className={styles.btnPlain}>
              Sign in
            </Link>
            <Link href="/get-started" className={styles.btnWarmCta}>
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroG}>
            <div>
              <div className={styles.pill}>
                <span className={styles.pillDot} />
                AI-Powered B2B Trade Matching
              </div>
              <h1 className={styles.h1}>
                Where the world&apos;s suppliers meet the buyers who need
                them.
              </h1>
              <p className={styles.heroSub}>
                Gracera&apos;s matching engine scores supplier–buyer
                compatibility across 6 dimensions and surfaces your best
                matches — with a plain-language explanation for every
                introduction.
              </p>
              <div className={styles.ctas}>
                <Link href="/get-started" className={styles.btnTealWarm}>
                  List as a supplier
                </Link>
                <Link href="/get-started" className={styles.btnOrangeWarm}>
                  Post a sourcing request
                </Link>
              </div>
              <div className={styles.trust}>
                <span className={styles.trustI}>No pay-to-rank</span>
                <span className={styles.trustI}>KYB verified</span>
                <span className={styles.trustI}>15 B2B verticals</span>
                <span className={styles.trustI}>40+ countries</span>
              </div>
            </div>
            <div className={styles.heroVis}>
              <HeroNetworkCanvas />
            </div>
          </div>
        </div>
      </section>

      <div style={{ padding: "2.5rem 0" }}>
        <div className={styles.stats}>
          <div className={styles.statW}>
            <div className={styles.svW}>
              6<sup className={styles.svWSup}>×</sup>
            </div>
            <div className={styles.slW}>Matching dimensions</div>
          </div>
          <div className={styles.statW}>
            <div className={styles.svW}>15</div>
            <div className={styles.slW}>B2B verticals</div>
          </div>
          <div className={styles.statW}>
            <div className={styles.svW}>
              40<sup className={styles.svWSup}>+</sup>
            </div>
            <div className={styles.slW}>Countries</div>
          </div>
          <div className={styles.statW}>
            <div className={styles.svW}>0</div>
            <div className={styles.slW}>Pay-to-rank positions</div>
          </div>
        </div>
      </div>

      <section className={styles.illusSec}>
        <div className={styles.container}>
          <div className={styles.illusHd}>
            <div className={styles.secPill}>The Gracera World</div>
            <h2 className={styles.h2}>Suppliers and buyers, connected by AI</h2>
            <p className={styles.illusP}>
              Verified factories and manufacturers on one side. Importers,
              distributors, and SME buyers on the other. Gracera AI in the
              middle — scoring every match across 6 dimensions.
            </p>
          </div>
          <div className={styles.illusWrap}>
            <svg viewBox="0 0 1100 420" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="1100" height="420" fill="#FEF9F4" />
              <rect x="0" y="348" width="1100" height="72" fill="#E8D9C6" />
              <rect x="0" y="348" width="1100" height="5" fill="#D4C0A6" />
              <ellipse cx="290" cy="58" rx="52" ry="18" fill="white" opacity=".7" />
              <ellipse cx="334" cy="48" rx="40" ry="16" fill="white" opacity=".55" />
              <ellipse cx="810" cy="66" rx="46" ry="17" fill="white" opacity=".65" />
              <ellipse cx="858" cy="55" rx="36" ry="15" fill="white" opacity=".5" />

              <rect x="22" y="46" width="34" height="22" rx="6" fill="rgba(34,197,94,.16)" />
              <text x="39" y="61" textAnchor="middle" fontSize="10" fontWeight="700" fill="#166534" fontFamily="system-ui,sans-serif">
                KR
              </text>
              <rect x="64" y="46" width="34" height="22" rx="6" fill="rgba(34,197,94,.11)" />
              <text x="81" y="61" textAnchor="middle" fontSize="10" fontWeight="700" fill="#166534" fontFamily="system-ui,sans-serif">
                CN
              </text>
              <rect x="106" y="46" width="34" height="22" rx="6" fill="rgba(34,197,94,.07)" />
              <text x="123" y="61" textAnchor="middle" fontSize="10" fontWeight="700" fill="#166534" fontFamily="system-ui,sans-serif">
                BD
              </text>

              <rect x="22" y="126" width="182" height="222" rx="4" fill="#F0E6D6" stroke="#D4C0A6" strokeWidth="1.5" />
              <rect x="22" y="114" width="182" height="16" rx="4" fill="#D4C0A6" />
              <rect x="34" y="108" width="158" height="10" rx="2" fill="#C4AE94" />

              <rect x="40" y="148" width="34" height="26" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />
              <rect x="88" y="148" width="34" height="26" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />
              <rect x="136" y="148" width="34" height="26" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />
              <rect x="40" y="190" width="34" height="26" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />
              <rect x="88" y="190" width="34" height="26" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />
              <rect x="136" y="190" width="34" height="26" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />
              <rect x="40" y="232" width="34" height="26" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />
              <rect x="88" y="232" width="34" height="26" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />
              <rect x="136" y="232" width="34" height="26" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />

              <rect x="75" y="290" width="56" height="58" rx="2" fill="#C4AE94" />
              <line x1="103" y1="290" x2="103" y2="348" stroke="#B09880" strokeWidth="1.5" />

              <rect x="56" y="70" width="18" height="48" rx="2" fill="#C4AE94" />
              <rect x="53" y="66" width="24" height="8" rx="2" fill="#B8A090" />
              <circle cx="65" cy="58" r="11" fill="rgba(255,255,255,.55)" />
              <circle cx="59" cy="46" r="9" fill="rgba(255,255,255,.38)" />
              <circle cx="66" cy="36" r="7" fill="rgba(255,255,255,.2)" />

              <rect x="126" y="82" width="15" height="36" rx="2" fill="#C4AE94" />
              <rect x="123" y="78" width="21" height="7" rx="2" fill="#B8A090" />
              <circle cx="133" cy="72" r="9" fill="rgba(255,255,255,.5)" />
              <circle cx="127" cy="62" r="7" fill="rgba(255,255,255,.32)" />

              <rect x="22" y="132" width="182" height="16" fill="rgba(34,197,94,.14)" />
              <text x="113" y="145" textAnchor="middle" fontSize="11" fontWeight="700" fill="#22C55E" fontFamily="system-ui,sans-serif">
                SUPPLIER
              </text>

              <rect x="214" y="202" width="128" height="146" rx="4" fill="#EAE0D2" stroke="#D4C0A6" strokeWidth="1.5" />
              <rect x="214" y="190" width="128" height="16" rx="4" fill="#D4C0A6" />
              <rect x="220" y="216" width="36" height="28" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />
              <rect x="280" y="216" width="36" height="28" rx="3" fill="#B8D0C8" stroke="#A8BEB6" strokeWidth="1" />

              <rect x="220" y="270" width="44" height="78" rx="2" fill="#C4AE94" stroke="#B09880" strokeWidth="1" />
              <line x1="220" y1="287" x2="264" y2="287" stroke="#B09880" strokeWidth="1" />
              <line x1="220" y1="304" x2="264" y2="304" stroke="#B09880" strokeWidth="1" />
              <line x1="220" y1="321" x2="264" y2="321" stroke="#B09880" strokeWidth="1" />
              <rect x="278" y="270" width="44" height="78" rx="2" fill="#C4AE94" stroke="#B09880" strokeWidth="1" />
              <line x1="278" y1="287" x2="322" y2="287" stroke="#B09880" strokeWidth="1" />
              <line x1="278" y1="304" x2="322" y2="304" stroke="#B09880" strokeWidth="1" />
              <line x1="278" y1="321" x2="322" y2="321" stroke="#B09880" strokeWidth="1" />

              <circle cx="358" cy="316" r="13" fill="#C4AE94" />
              <rect x="347" y="328" width="22" height="20" rx="6" fill="#8C7260" />

              <rect x="354" y="310" width="36" height="30" rx="2" fill="#F97316" opacity=".75" />
              <line x1="354" y1="310" x2="390" y2="310" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
              <line x1="372" y1="310" x2="372" y2="340" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
              <rect x="408" y="316" width="30" height="26" rx="2" fill="#F97316" opacity=".6" />
              <rect x="456" y="314" width="28" height="28" rx="2" fill="#22C55E" opacity=".6" />

              <path d="M370 236 C450 188 506 208 538 242" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="7,5" fill="none" opacity=".55" />
              <path d="M360 284 C440 262 506 262 538 258" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="7,5" fill="none" opacity=".35" />
              <path d="M616 242 C650 202 706 186 752 226" stroke="#F97316" strokeWidth="1.5" strokeDasharray="7,5" fill="none" opacity=".55" />
              <path d="M616 258 C654 262 706 268 752 278" stroke="#F97316" strokeWidth="1.5" strokeDasharray="7,5" fill="none" opacity=".35" />

              <circle cx="577" cy="248" r="92" fill="rgba(34,197,94,.04)" />
              <circle cx="577" cy="248" r="70" fill="rgba(34,197,94,.06)" />
              <circle cx="577" cy="248" r="52" fill="rgba(34,197,94,.09)" />
              <circle cx="577" cy="248" r="40" fill="#241810" />
              <circle cx="577" cy="248" r="40" fill="none" stroke="rgba(34,197,94,.28)" strokeWidth="1.5" />
              <text x="577" y="240" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,.35)" fontWeight="600" fontFamily="system-ui,sans-serif">
                gracera
              </text>
              <text x="577" y="260" textAnchor="middle" fontSize="18" fill="#22C55E" fontWeight="800" fontFamily="system-ui,sans-serif">
                AI
              </text>

              <rect x="524" y="156" width="106" height="40" rx="20" fill="#22C55E" />
              <text x="577" y="176" textAnchor="middle" fontSize="12.5" fill="white" fontWeight="700" fontFamily="system-ui,sans-serif">
                89% match
              </text>
              <text x="577" y="190" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.75)" fontFamily="system-ui,sans-serif">
                6 dimensions scored
              </text>
              <line x1="577" y1="196" x2="577" y2="208" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="3,2" />

              <rect x="638" y="312" width="34" height="30" rx="2" fill="#22C55E" opacity=".7" />
              <line x1="638" y1="312" x2="672" y2="312" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
              <line x1="655" y1="312" x2="655" y2="342" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
              <rect x="686" y="316" width="30" height="26" rx="2" fill="#22C55E" opacity=".55" />
              <rect x="728" y="314" width="28" height="28" rx="2" fill="#F97316" opacity=".65" />

              <rect x="992" y="46" width="34" height="22" rx="6" fill="rgba(249,115,22,.18)" />
              <text x="1009" y="61" textAnchor="middle" fontSize="10" fontWeight="700" fill="#9a3412" fontFamily="system-ui,sans-serif">
                US
              </text>
              <rect x="1034" y="46" width="34" height="22" rx="6" fill="rgba(249,115,22,.12)" />
              <text x="1051" y="61" textAnchor="middle" fontSize="10" fontWeight="700" fill="#9a3412" fontFamily="system-ui,sans-serif">
                DE
              </text>
              <rect x="1074" y="46" width="34" height="22" rx="6" fill="rgba(249,115,22,.08)" />
              <text x="1091" y="61" textAnchor="middle" fontSize="10" fontWeight="700" fill="#9a3412" fontFamily="system-ui,sans-serif">
                GB
              </text>

              <rect x="948" y="158" width="88" height="26" rx="13" fill="rgba(249,115,22,.12)" stroke="rgba(249,115,22,.22)" strokeWidth="1" />
              <text x="992" y="176" textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#F97316" fontFamily="system-ui,sans-serif">
                BUYER
              </text>

              <rect x="782" y="88" width="112" height="260" rx="4" fill="#E8F4F0" stroke="#B8D8D0" strokeWidth="1.5" />
              <rect x="782" y="88" width="112" height="16" rx="4" fill="#22C55E" opacity=".55" />
              <rect x="782" y="98" width="112" height="6" fill="#22C55E" opacity=".55" />

              <rect x="794" y="114" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="129" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="144" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="159" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="174" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="189" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="204" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="219" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="234" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="249" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="264" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <rect x="794" y="279" width="88" height="9" rx="1" fill="rgba(34,197,94,.18)" />
              <line x1="838" y1="108" x2="838" y2="348" stroke="rgba(34,197,94,.08)" strokeWidth="1" />

              <rect x="812" y="298" width="52" height="50" rx="2" fill="rgba(34,197,94,.14)" stroke="rgba(34,197,94,.2)" strokeWidth="1" />
              <line x1="838" y1="298" x2="838" y2="348" stroke="rgba(34,197,94,.2)" strokeWidth="1" />

              <rect x="908" y="196" width="170" height="152" rx="4" fill="#FFF3E8" stroke="#F0D0B0" strokeWidth="1.5" />
              <rect x="908" y="182" width="170" height="18" rx="4" fill="#F97316" opacity=".5" />
              <rect x="908" y="192" width="170" height="8" fill="#F97316" opacity=".5" />

              <rect x="918" y="200" width="150" height="14" rx="2" fill="#F97316" opacity=".82" />
              <line x1="944" y1="200" x2="944" y2="214" stroke="rgba(255,255,255,.3)" strokeWidth="7" />
              <line x1="976" y1="200" x2="976" y2="214" stroke="rgba(255,255,255,.3)" strokeWidth="7" />
              <line x1="1008" y1="200" x2="1008" y2="214" stroke="rgba(255,255,255,.3)" strokeWidth="7" />
              <line x1="1040" y1="200" x2="1040" y2="214" stroke="rgba(255,255,255,.3)" strokeWidth="7" />

              <rect x="918" y="222" width="72" height="60" rx="2" fill="rgba(249,115,22,.1)" stroke="rgba(249,115,22,.25)" strokeWidth="1.5" />
              <line x1="920" y1="224" x2="938" y2="242" stroke="rgba(255,255,255,.45)" strokeWidth="1.5" />
              <rect x="1004" y="222" width="66" height="60" rx="2" fill="rgba(249,115,22,.1)" stroke="rgba(249,115,22,.25)" strokeWidth="1.5" />
              <line x1="1006" y1="224" x2="1022" y2="240" stroke="rgba(255,255,255,.45)" strokeWidth="1.5" />

              <rect x="950" y="292" width="36" height="56" rx="2" fill="rgba(249,115,22,.18)" stroke="rgba(249,115,22,.28)" strokeWidth="1" />
              <line x1="968" y1="292" x2="968" y2="348" stroke="rgba(249,115,22,.2)" strokeWidth="1" />

              <rect x="928" y="214" width="124" height="10" rx="2" fill="rgba(249,115,22,.22)" />

              <circle cx="760" cy="316" r="13" fill="#C4AE94" />
              <rect x="749" y="328" width="22" height="20" rx="6" fill="#8C7260" />
            </svg>
          </div>
        </div>
      </section>

      <section className={styles.story}>
        <div className={styles.container}>
          <div className={styles.storyG}>
            <div>
              <div className={styles.secPill}>AI Matching Engine</div>
              <h2 className={styles.h2}>
                Every introduction comes with a score and a reason
              </h2>
              <p className={styles.storyP}>
                The matching agent doesn&apos;t just rank — it explains. Each
                introduction shows exactly why the pairing scored well, so you
                can decide confidently — not blindly.
              </p>
            </div>
            <div className={styles.storyCards}>
              <MatchScoreCard />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className={styles.how}>
        <div className={styles.container}>
          <div className={styles.secPill}>How it works</div>
          <h2 className={styles.h2}>Three steps from profile to closed deal</h2>
          <div className={styles.howG}>
            <div className={styles.howCard}>
              <div className={styles.howIllus}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <rect width="72" height="72" rx="20" fill="var(--teal-bg)" />
                  <rect x="20" y="20" width="28" height="36" rx="4" fill="var(--warm-100)" stroke="var(--warm-200)" strokeWidth="1.5" transform="rotate(-6 34 38)" />
                  <rect x="16" y="14" width="30" height="38" rx="4" fill="white" stroke="var(--warm-200)" strokeWidth="1.5" />
                  <rect x="16" y="14" width="30" height="9" rx="4" fill="var(--warm-100)" />
                  <rect x="16" y="19" width="30" height="4" fill="var(--warm-100)" />
                  <rect x="22" y="29" width="18" height="2.5" rx="1.25" fill="var(--warm-200)" />
                  <rect x="22" y="35" width="14" height="2.5" rx="1.25" fill="var(--warm-200)" />
                  <rect x="22" y="41" width="16" height="2.5" rx="1.25" fill="var(--warm-200)" />
                  <circle cx="52" cy="52" r="14" fill="var(--teal)" />
                  <path d="M52 59v-12m0 0l-5 5m5-5l5 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.howN}>01 — Profile</div>
              <h3>Build your verified business profile</h3>
              <p>
                Upload your catalog. AI extracts categories, MOQ,
                certifications, and target markets. KYB verification in 24
                hours. Your profile is live immediately.
              </p>
            </div>
            <div className={styles.howCard}>
              <div className={styles.howIllus}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <rect width="72" height="72" rx="20" fill="rgba(249,115,22,.08)" />
                  <circle cx="14" cy="36" r="10" fill="white" stroke="var(--teal)" strokeWidth="1.5" />
                  <text x="14" y="40" textAnchor="middle" fontSize="6.5" fill="var(--teal)" fontWeight="700" fontFamily="system-ui,sans-serif">
                    SUP
                  </text>
                  <circle cx="58" cy="36" r="10" fill="white" stroke="var(--orange)" strokeWidth="1.5" />
                  <text x="58" y="40" textAnchor="middle" fontSize="6.5" fill="var(--orange)" fontWeight="700" fontFamily="system-ui,sans-serif">
                    BUY
                  </text>
                  <circle cx="36" cy="36" r="14" fill="var(--ink)" />
                  <text x="36" y="33" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,.4)" fontWeight="600" fontFamily="system-ui,sans-serif">
                    gracera
                  </text>
                  <text x="36" y="44" textAnchor="middle" fontSize="11" fill="var(--teal)" fontWeight="700" fontFamily="system-ui,sans-serif">
                    AI
                  </text>
                  <line x1="24" y1="33" x2="22" y2="33" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="2,2" />
                  <line x1="24" y1="39" x2="22" y2="39" stroke="var(--teal)" strokeWidth="1.5" strokeDasharray="2,2" />
                  <line x1="48" y1="33" x2="50" y2="33" stroke="var(--orange)" strokeWidth="1.5" strokeDasharray="2,2" />
                  <line x1="48" y1="39" x2="50" y2="39" stroke="var(--orange)" strokeWidth="1.5" strokeDasharray="2,2" />
                  <rect x="24" y="10" width="24" height="13" rx="6.5" fill="var(--teal)" />
                  <text x="36" y="20.5" textAnchor="middle" fontSize="7.5" fill="white" fontWeight="700" fontFamily="system-ui,sans-serif">
                    94%
                  </text>
                </svg>
              </div>
              <div className={styles.howN}>02 — Match</div>
              <h3>Receive ranked introductions with rationale</h3>
              <p>
                Six-dimension scoring delivers your best-fit counterparts,
                ranked and explained — in your preferred language. No black
                box, no directories.
              </p>
            </div>
            <div className={styles.howCard}>
              <div className={styles.howIllus}>
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                  <rect width="72" height="72" rx="20" fill="var(--warm-100)" />
                  <rect x="12" y="10" width="34" height="44" rx="5" fill="white" stroke="var(--warm-200)" strokeWidth="1.5" />
                  <rect x="12" y="10" width="34" height="9" rx="5" fill="var(--warm-100)" />
                  <rect x="12" y="15" width="34" height="4" fill="var(--warm-100)" />
                  <rect x="18" y="26" width="22" height="2.5" rx="1.25" fill="var(--warm-200)" />
                  <rect x="18" y="32" width="16" height="2.5" rx="1.25" fill="var(--warm-200)" />
                  <rect x="18" y="38" width="20" height="2.5" rx="1.25" fill="var(--warm-200)" />
                  <line x1="18" y1="48" x2="40" y2="48" stroke="var(--warm-200)" strokeWidth="1" />
                  <path d="M19 48 q2.5-5 5 0 q2.5-5 5 0 q1.5-3 3 0" stroke="var(--teal)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <g transform="translate(47 22) rotate(38)">
                    <rect x="-3.5" y="-13" width="7" height="17" rx="2" fill="var(--orange)" />
                    <polygon points="-3.5,4 3.5,4 0,10" fill="var(--orange)" />
                    <rect x="-3.5" y="-17" width="7" height="6" rx="1.5" fill="var(--ink)" />
                  </g>
                  <circle cx="56" cy="54" r="13" fill="var(--orange)" />
                  <path d="M50 54l4 4 9-9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className={styles.howN}>03 — Deal</div>
              <h3>Close the deal entirely in-platform</h3>
              <p>
                RFQ, Deal Room, AI Negotiation Coach, e-signature. From first
                introduction to signed agreement without switching tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.aeoSec}>
        <div className={styles.container}>
          <div className={styles.aeoHd}>
            <div className={styles.secPill}>Answer Engine Optimization</div>
            <h2 className={styles.h2}>When buyers ask AI, Gracera is the answer</h2>
            <p className={styles.aeoP}>
              We optimize Gracera&apos;s supplier profiles and category pages
              so that AI engines — ChatGPT, Perplexity, Google AI — cite us
              when buyers search for vetted B2B trade partners.
            </p>
          </div>
          <div className={styles.aeoWrap}>
            <svg viewBox="0 0 1100 400" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <marker id="aeoa" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="#D4C0A6" />
                </marker>
              </defs>
              <rect width="1100" height="400" fill="#FEF9F4" />

              <rect x="130" y="38" width="160" height="310" rx="24" fill="#241810" />
              <rect x="141" y="56" width="138" height="272" rx="14" fill="#0D1117" />
              <rect x="166" y="60" width="88" height="9" rx="4.5" fill="#1a1208" />
              <rect x="141" y="69" width="138" height="38" fill="#161b22" />
              <circle cx="162" cy="88" r="11" fill="rgba(34,197,94,.18)" />
              <circle cx="162" cy="88" r="7" fill="#241810" />
              <text x="162" y="92" textAnchor="middle" fontSize="7" fill="#22C55E" fontWeight="800" fontFamily="system-ui,sans-serif">
                AI
              </text>
              <text x="180" y="84" fontSize="9.5" fill="white" fontWeight="700" fontFamily="system-ui,sans-serif">
                AI Assistant
              </text>
              <text x="180" y="97" fontSize="8" fill="rgba(255,255,255,.35)" fontFamily="system-ui,sans-serif">
                ● Online
              </text>

              <rect x="163" y="122" width="105" height="48" rx="13" fill="#22C55E" opacity=".85" />
              <text x="215" y="140" textAnchor="middle" fontSize="8.5" fill="white" fontFamily="system-ui,sans-serif">
                Where to find
              </text>
              <text x="215" y="153" textAnchor="middle" fontSize="8.5" fill="white" fontFamily="system-ui,sans-serif">
                Korean food
              </text>
              <text x="215" y="166" textAnchor="middle" fontSize="8.5" fill="white" fontFamily="system-ui,sans-serif">
                suppliers?
              </text>

              <rect x="142" y="186" width="108" height="76" rx="13" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
              <text x="150" y="203" fontSize="8" fill="rgba(255,255,255,.65)" fontFamily="system-ui,sans-serif">
                I recommend
              </text>
              <text x="150" y="216" fontSize="9" fill="#22C55E" fontWeight="700" fontFamily="system-ui,sans-serif">
                Gracera.ai
              </text>
              <text x="150" y="229" fontSize="7.5" fill="rgba(255,255,255,.55)" fontFamily="system-ui,sans-serif">
                Verified suppliers,
              </text>
              <text x="150" y="241" fontSize="7.5" fill="rgba(255,255,255,.55)" fontFamily="system-ui,sans-serif">
                AI-matched, KYB-
              </text>
              <text x="150" y="253" fontSize="7.5" fill="rgba(255,255,255,.55)" fontFamily="system-ui,sans-serif">
                verified. Free to join.
              </text>

              <rect x="142" y="272" width="108" height="22" rx="8" fill="rgba(34,197,94,.18)" stroke="rgba(34,197,94,.3)" strokeWidth="1" />
              <text x="196" y="287" textAnchor="middle" fontSize="8" fill="#22C55E" fontWeight="700" fontFamily="system-ui,sans-serif">
                gracera.ai/suppliers
              </text>

              <rect x="175" y="322" width="70" height="4" rx="2" fill="rgba(255,255,255,.18)" />

              <rect x="112" y="366" width="196" height="20" rx="10" fill="rgba(34,197,94,.07)" />
              <text x="210" y="380" textAnchor="middle" fontSize="9.5" fill="#8C7260" fontFamily="system-ui,sans-serif">
                Buyer asks an AI chatbot
              </text>

              <path d="M300 200 C340 200 370 200 408 200" stroke="#D4C0A6" strokeWidth="2" strokeDasharray="6,4" markerEnd="url(#aeoa)" />
              <text x="354" y="192" textAnchor="middle" fontSize="8.5" fill="#B8A090" fontFamily="system-ui,sans-serif">
                cited by
              </text>

              <rect x="424" y="44" width="650" height="88" rx="12" fill="white" stroke="#E8D9C6" strokeWidth="1.5" />
              <circle cx="458" cy="88" r="22" fill="rgba(16,185,129,.1)" />
              <circle cx="458" cy="88" r="15" fill="#241810" />
              <text x="458" y="93" textAnchor="middle" fontSize="11" fill="#10B981" fontWeight="800" fontFamily="system-ui,sans-serif">
                ✦
              </text>
              <text x="490" y="67" fontSize="10.5" fill="#241810" fontWeight="700" fontFamily="system-ui,sans-serif">
                ChatGPT
              </text>
              <text x="490" y="84" fontSize="9.5" fill="#4A3525" fontFamily="system-ui,sans-serif">
                For verified Korean food suppliers I recommend
              </text>
              <text x="806" y="84" fontSize="9.5" fill="#22C55E" fontWeight="700" fontFamily="system-ui,sans-serif">
                Gracera.ai
              </text>
              <text x="490" y="100" fontSize="9.5" fill="#4A3525" fontFamily="system-ui,sans-serif">
                — AI-matched B2B trade platform with KYB verification across 40+ countries.
              </text>
              <rect x="990" y="74" width="70" height="20" rx="10" fill="rgba(34,197,94,.1)" stroke="rgba(34,197,94,.25)" strokeWidth="1" />
              <text x="1025" y="88" textAnchor="middle" fontSize="8.5" fill="#166534" fontWeight="600" fontFamily="system-ui,sans-serif">
                ✓ Cited
              </text>

              <rect x="424" y="152" width="650" height="88" rx="12" fill="white" stroke="#E8D9C6" strokeWidth="1.5" />
              <circle cx="458" cy="196" r="22" fill="rgba(99,102,241,.1)" />
              <circle cx="458" cy="196" r="15" fill="#241810" />
              <text x="458" y="201" textAnchor="middle" fontSize="11" fill="#818CF8" fontWeight="800" fontFamily="system-ui,sans-serif">
                ✦
              </text>
              <text x="490" y="175" fontSize="10.5" fill="#241810" fontWeight="700" fontFamily="system-ui,sans-serif">
                Perplexity
              </text>
              <text x="490" y="192" fontSize="9.5" fill="#4A3525" fontFamily="system-ui,sans-serif">
                Top B2B sourcing platforms:
              </text>
              <text x="636" y="192" fontSize="9.5" fill="#22C55E" fontWeight="700" fontFamily="system-ui,sans-serif">
                Gracera.ai
              </text>
              <text x="700" y="192" fontSize="9.5" fill="#4A3525" fontFamily="system-ui,sans-serif">
                (AI-matched, 15 verticals),
              </text>
              <text x="490" y="208" fontSize="9.5" fill="#4A3525" fontFamily="system-ui,sans-serif">
                Alibaba, GlobalSources. Gracera stands out for SME-focused verified introductions.
              </text>
              <rect x="990" y="182" width="70" height="20" rx="10" fill="rgba(34,197,94,.1)" stroke="rgba(34,197,94,.25)" strokeWidth="1" />
              <text x="1025" y="196" textAnchor="middle" fontSize="8.5" fill="#166534" fontWeight="600" fontFamily="system-ui,sans-serif">
                ✓ Cited
              </text>

              <rect x="424" y="260" width="650" height="88" rx="12" fill="white" stroke="#E8D9C6" strokeWidth="1.5" />
              <circle cx="458" cy="304" r="22" fill="rgba(249,115,22,.1)" />
              <circle cx="458" cy="304" r="15" fill="#241810" />
              <text x="458" y="309" textAnchor="middle" fontSize="11" fill="#F97316" fontWeight="800" fontFamily="system-ui,sans-serif">
                ✦
              </text>
              <text x="490" y="283" fontSize="10.5" fill="#241810" fontWeight="700" fontFamily="system-ui,sans-serif">
                Google AI Overview
              </text>
              <text x="490" y="300" fontSize="9.5" fill="#4A3525" fontFamily="system-ui,sans-serif">
                Best platform for B2B trade matching:
              </text>
              <text x="688" y="300" fontSize="9.5" fill="#22C55E" fontWeight="700" fontFamily="system-ui,sans-serif">
                Gracera.ai
              </text>
              <text x="750" y="300" fontSize="9.5" fill="#4A3525" fontFamily="system-ui,sans-serif">
                connects verified
              </text>
              <text x="490" y="316" fontSize="9.5" fill="#4A3525" fontFamily="system-ui,sans-serif">
                suppliers and buyers across 15 B2B verticals in 40+ countries. Zero pay-to-rank.
              </text>
              <rect x="990" y="290" width="70" height="20" rx="10" fill="rgba(34,197,94,.1)" stroke="rgba(34,197,94,.25)" strokeWidth="1" />
              <text x="1025" y="304" textAnchor="middle" fontSize="8.5" fill="#166534" fontWeight="600" fontFamily="system-ui,sans-serif">
                ✓ Cited
              </text>

              <rect x="630" y="364" width="280" height="20" rx="10" fill="rgba(34,197,94,.07)" />
              <text x="770" y="378" textAnchor="middle" fontSize="9.5" fill="#8C7260" fontFamily="system-ui,sans-serif">
                Gracera cited as the answer across AI platforms
              </text>
            </svg>
          </div>
        </div>
      </section>

      <section className={styles.ctaSec}>
        <div className={styles.container}>
          <div className={styles.ctaG}>
            <div id="for-suppliers" className={`${styles.ctaCard} ${styles.ctaT}`}>
              <div className={`${styles.pill} ${styles.ctaCardPill}`}>
                <span className={styles.pillDot} style={{ background: "rgba(255,255,255,.7)" }} />
                For suppliers
              </div>
              <h2 className={styles.ctaCardH2}>
                Reach verified buyers. Build your global pipeline.
              </h2>
              <p>
                Upload your catalog, complete your profile, and start
                receiving ranked buyer introductions within 24 hours of
                verification.
              </p>
              <Link href="/get-started" className={styles.btnWhite}>
                List as a supplier — it&apos;s free
              </Link>
              <p className={styles.ctaNote}>Free tier · 3 AI matches/month</p>
            </div>
            <div id="for-buyers" className={`${styles.ctaCard} ${styles.ctaO}`}>
              <div className={`${styles.pill} ${styles.ctaCardPill}`}>
                <span className={styles.pillDot} style={{ background: "rgba(255,255,255,.7)" }} />
                For buyers
              </div>
              <h2 className={styles.ctaCardH2}>
                Find the right supplier. Close faster.
              </h2>
              <p>
                Describe what you need. Gracera surfaces ranked supplier
                matches within hours. No credit card required to start.
              </p>
              <Link href="/get-started" className={`${styles.btnWhite} ${styles.btnWhiteO}`}>
                Post a sourcing request — it&apos;s free
              </Link>
              <p className={styles.ctaNote}>Free tier · 5 AI match suggestions</p>
            </div>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.ftR}>
            <Link href="/" className={styles.ftLogo}>
              <span className={styles.ftLm}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <circle cx="5" cy="5" r="2.5" fill="white" opacity=".9" />
                  <circle cx="11" cy="5" r="2.5" fill="white" opacity=".55" />
                </svg>
              </span>
              gracera.ai
            </Link>
            <ul className={styles.ftLinks}>
              <li>
                <a href="#how-it-works">How it works</a>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
            </ul>
            <p className={styles.ftCopy}>© 2026 Gracera. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
