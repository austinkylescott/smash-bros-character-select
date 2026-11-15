<script setup lang="ts">
/**
 * Ultimate's player panels as they look before anyone has picked: Player 1 and a random CPU.
 * Drawn only; adding, removing and filling panels comes with the hands and tokens.
 */
</script>

<template>
  <div class="panels" aria-hidden="true">
    <svg class="shapes" viewBox="0 662 1920 418">
      <defs>
        <linearGradient id="ult-floor" x1="0" x2="1">
          <stop offset="0" stop-color="#4b2bb0" />
          <stop offset="0.28" stop-color="#2f6fd8" />
          <stop offset="0.55" stop-color="#5fd0ea" />
          <stop offset="0.8" stop-color="#d9f4f6" />
          <stop offset="1" stop-color="#ffffff" />
        </linearGradient>
        <linearGradient id="ult-seam" x1="0" x2="1">
          <stop offset="0" stop-color="#5a3ad0" />
          <stop offset="0.35" stop-color="#2d8bf0" />
          <stop offset="0.6" stop-color="#ff5aa0" />
          <stop offset="0.75" stop-color="#ffd86a" />
          <stop offset="1" stop-color="#ffffff" />
        </linearGradient>
        <linearGradient id="ult-p1-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ff4040" />
          <stop offset="1" stop-color="#e3121e" />
        </linearGradient>
        <linearGradient id="ult-p1-pink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ef2a77" />
          <stop offset="1" stop-color="#c41a5e" />
        </linearGradient>
        <linearGradient id="ult-cpu" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#d4d4d4" />
          <stop offset="1" stop-color="#9b9b9b" />
        </linearGradient>
      </defs>

      <rect x="0" y="662" width="1920" height="418" fill="url(#ult-floor)" />
      <polygon points="1100,662 1500,662 1300,1080 900,1080" fill="#fff" opacity="0.18" />
      <rect x="0" y="672" width="1920" height="10" fill="url(#ult-seam)" />

      <!-- Player 1. -->
      <polygon points="96,694 922,694 922,1080 14,1080 14,776" fill="#141414" />
      <polygon points="104,704 912,704 912,1080 24,1080 24,784" fill="url(#ult-p1-pink)" />
      <polygon points="104,704 380,704 24,960 24,784" fill="#f6dfe6" opacity="0.85" />
      <polygon points="200,704 470,704 260,1080 24,1080 24,990" fill="#f2b8ca" opacity="0.45" />
      <polygon points="470,704 912,704 912,1080 400,1080" fill="url(#ult-p1-red)" />
      <polygon points="470,704 520,704 440,1080 400,1080" fill="#ff7a7a" opacity="0.5" />
      <polygon points="24,1010 300,1080 24,1080" fill="#b0124e" opacity="0.6" />

      <!-- Player 1's name plate and tag. -->
      <rect x="492" y="928" width="362" height="60" fill="#3a1418" />
      <rect x="497" y="933" width="352" height="50" fill="#f6a2ae" />
      <polygon points="508,1004 840,1004 858,1022 858,1080 490,1080 490,1022" fill="#2a0c0e" />
      <polygon points="512,1010 836,1010 852,1026 852,1080 496,1080 496,1026" fill="#e8141c" />
      <polygon points="512,1010 640,1010 600,1080 496,1080 496,1026" fill="#c40f17" />
      <g fill="#e8141c" opacity="0.5">
        <polygon points="560,1010 570,1010 530,1080 520,1080" fill="#ff5a5a" />
      </g>

      <!-- The CPU. -->
      <polygon points="1010,694 1840,694 1840,1080 930,1080 930,776" fill="#141414" />
      <polygon points="1018,704 1830,704 1830,1080 940,1080 940,784" fill="url(#ult-cpu)" />
      <polygon points="1018,704 1250,704 940,1000 940,784" fill="#f2f2f2" opacity="0.9" />
      <polygon points="1300,704 1480,704 1380,1080 1180,1080" fill="#7d7d7d" opacity="0.5" />
      <polygon
        points="1520,704 1830,704 1830,850 1600,1080 1440,1080"
        fill="#e2e2e2"
        opacity="0.55"
      />

      <!-- The CPU's level bar and tag. -->
      <rect x="1405" y="926" width="366" height="64" fill="#1b1b1b" />
      <polygon points="1411,932 1620,932 1600,984 1411,984" fill="#2f2f2f" />
      <polygon points="1620,932 1765,932 1765,984 1600,984" fill="#f4f4f4" />
      <polygon
        points="1424,1004 1754,1004 1772,1022 1772,1080 1404,1080 1404,1022"
        fill="#1b1b1b"
      />
      <polygon
        points="1428,1010 1750,1010 1766,1026 1766,1080 1410,1080 1410,1026"
        fill="#cfcfcf"
      />
      <polygon points="1428,1010 1560,1010 1520,1080 1410,1080 1410,1026" fill="#b1b1b1" />

      <!-- Add and remove player tabs. -->
      <polygon points="1844,806 1906,834 1906,936 1844,936" fill="#141414" />
      <polygon points="1850,816 1900,838 1900,930 1850,930" fill="#f5f5f5" />
      <polygon points="1844,944 1906,944 1906,1080 1844,1080" fill="#141414" />
      <polygon points="1850,950 1900,950 1900,1080 1850,1080" fill="#3b3b3b" />
      <g fill="#f08a1c">
        <circle cx="1880" cy="874" r="11" />
        <path d="M1866 912v-14c0-7 6-12 14-12s14 5 14 12v14z" />
        <path d="M1852 898h8v-8h6v8h8v6h-8v8h-6v-8h-8z" />
      </g>
      <g fill="#fff">
        <circle cx="1880" cy="1008" r="11" />
        <path d="M1866 1046v-14c0-7 6-12 14-12s14 5 14 12v14z" />
        <rect x="1852" y="1028" width="22" height="6" />
      </g>
    </svg>

    <!-- Player 1's hand, waiting in the panel. -->
    <svg class="glove" viewBox="0 0 120 150">
      <g stroke="#5b1a22" stroke-width="5" stroke-linejoin="round" fill="#fdf3f4">
        <path
          d="M30 88V34a9 9 0 0 1 18 0v40V22a9 9 0 0 1 18 0v50V26a9 9 0 0 1 18 0v48V42a9 9 0 0 1 18 0v52c0 26-14 44-40 44H52c-14 0-22-8-28-20L8 92a9 9 0 0 1 14-10z"
        />
        <path d="M42 132h48v14H42z" fill="#e8c9cd" />
      </g>
      <text x="62" y="104" text-anchor="middle" class="glove-tag">P1</text>
    </svg>

    <span class="text plate">Player 1</span>
    <span class="text tag p1 ult-outlined" data-text="P1">P1</span>
    <svg class="controller" viewBox="0 0 64 44">
      <g fill="#fff">
        <path
          d="M14 8h36c8 0 13 8 14 20 1 10-6 16-12 10l-6-6H18l-6 6C6 44-1 38 0 28 1 16 6 8 14 8z"
        />
      </g>
      <g fill="#e8141c">
        <rect x="12" y="20" width="12" height="4" />
        <rect x="16" y="16" width="4" height="12" />
        <circle cx="46" cy="18" r="3" />
        <circle cx="46" cy="27" r="3" />
        <circle cx="41" cy="22" r="3" />
        <circle cx="51" cy="22" r="3" />
      </g>
    </svg>
    <span class="lights"><i /><i /><i /><i /></span>

    <span class="text question ult-outlined" data-text="?">?</span>
    <span class="text random ult-outlined" data-text="Random">Random</span>
    <span class="text level-label">CPU Lv.</span>
    <span class="text level ult-outlined" data-text="9">9</span>
    <span class="text tag cpu ult-outlined" data-text="CPU">CPU</span>
  </div>
</template>

<style scoped>
.panels {
  position: absolute;
  inset: 662px 0 0;
}

.shapes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.panels > * {
  position: absolute;
}

/* Text sits on the stage's coordinates, measured from the panels' top at y = 662. */
.text {
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.tag,
.random,
.question {
  --stroke: 14px;
  color: #fff;
}

.glove {
  left: 612px;
  top: 112px;
  width: 124px;
}

.glove-tag {
  fill: #e8141c;
  font-family: var(--ult-font);
  font-size: 34px;
  font-weight: 900;
  stroke: #fff;
  stroke-width: 6px;
  paint-order: stroke fill;
}

.plate {
  left: 497px;
  top: 276px;
  width: 352px;
  color: #3b2a2d;
  font-size: 40px;
  text-align: center;
}

.tag {
  top: 350px;
  font-size: 66px;
}

.p1 {
  left: 712px;
}

.controller {
  left: 538px;
  top: 362px;
  width: 58px;
}

.lights {
  left: 541px;
  top: 351px;
  display: flex;
  gap: 4px;
}

.lights i {
  width: 9px;
  height: 7px;
  background: #ff9a9a;
}

.lights i:first-child {
  background: #7df05a;
}

.question {
  left: 1072px;
  top: 78px;
  font-size: 290px;
  --stroke: 26px;
  --stroke-color: #2a2a2a;
  text-shadow: 10px 10px 0 #555;
}

.random {
  right: 120px;
  top: 190px;
  font-size: 64px;
}

.level-label {
  left: 1430px;
  top: 278px;
  color: #c8c8c8;
  font-size: 40px;
}

.level {
  left: 1672px;
  top: 274px;
  color: #e8141c;
  font-size: 46px;
  --stroke: 6px;
}

.cpu {
  left: 1600px;
}
</style>
