export const clientCss = `
			:root {
				--black: #0a0a0a;
				--white: #fff;
				--red: #e63946;
				--red-dark: #c1121f;
				--gold: #d4a017;
				--gray-50: #f9f9f9;
				--gray-100: #f2f2f2;
				--gray-200: #e0e0e0;
				--gray-300: #c4c4c4;
				--gray-500: #888;
				--gray-700: #444;
				--gray-900: #1a1a1a;
				--r: 6px;
				--rlg: 12px;
			}
			*,
			*::before,
			*::after {
				box-sizing: border-box;
			}
			.client-page {
				font-family: "Barlow", sans-serif;
				background: var(--white);
				color: var(--black);
				min-height: 100vh;
				overflow-x: hidden;
			}
			.client-header {
				background: var(--black);
				height: 64px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 0 28px;
				position: sticky;
				top: 0;
				z-index: 200;
				border-bottom: 2px solid var(--red);
			}
			.logo {
				font-family: "Bebas Neue", cursive;
				font-size: 26px;
				color: var(--white);
				letter-spacing: 3px;
				display: flex;
				align-items: center;
				gap: 10px;
				text-decoration: none;
			}
			.logo-dot {
				width: 10px;
				height: 10px;
				background: var(--red);
				border-radius: 50%;
				display: inline-block;
			}
			nav {
				display: flex;
				gap: 8px;
				align-items: center;
			}
			.nav-btn {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 12px;
				font-weight: 700;
				letter-spacing: 1.5px;
				text-transform: uppercase;
				padding: 7px 16px;
				border-radius: var(--r);
				cursor: pointer;
				transition: all 0.2s;
				border: 1.5px solid transparent;
			}
			.nav-ghost {
				color: var(--gray-300);
				border-color: var(--gray-700);
				background: transparent;
			}
			.nav-ghost:hover {
				color: var(--white);
				border-color: var(--gray-300);
			}
			.nav-admin {
				color: var(--white);
				background: var(--red);
				border-color: var(--red);
			}
			.nav-admin:hover {
				background: var(--red-dark);
			}
			.hero {
				background: var(--black);
				padding: 64px 28px 56px;
				text-align: center;
				position: relative;
				overflow: hidden;
			}
			.hero::before {
				content: "";
				position: absolute;
				inset: 0;
				background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60L60 0M-10 10L10-10M50 70L70 50' stroke='%23E63946' stroke-width='0.3' opacity='0.12'/%3E%3C/svg%3E");
				opacity: 0.6;
			}
			.hero-tag {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 12px;
				font-weight: 700;
				letter-spacing: 4px;
				text-transform: uppercase;
				color: var(--red);
				margin-bottom: 14px;
				position: relative;
			}
			.hero h1 {
				font-family: "Bebas Neue", cursive;
				font-size: clamp(56px, 11vw, 100px);
				color: var(--white);
				line-height: 0.9;
				letter-spacing: 3px;
				position: relative;
			}
			.hero h1 em {
				color: var(--red);
				font-style: normal;
			}
			.hero-sub {
				font-size: 15px;
				color: var(--gray-300);
				margin-top: 18px;
				position: relative;
				font-weight: 400;
			}
			.hero-cta {
				margin-top: 36px;
				position: relative;
			}
			.btn-hero {
				font-family: "Bebas Neue", cursive;
				font-size: 22px;
				letter-spacing: 2px;
				background: var(--red);
				color: var(--white);
				border: none;
				padding: 18px 52px;
				border-radius: var(--r);
				cursor: pointer;
				transition: all 0.2s;
				display: inline-flex;
				align-items: center;
				gap: 12px;
			}
			.btn-hero:hover {
				background: var(--red-dark);
				transform: translateY(-2px);
			}
			.hero-strip {
				display: flex;
				justify-content: center;
				gap: 0;
				margin-top: 48px;
				position: relative;
				border-top: 1px solid rgba(255, 255, 255, 0.08);
				padding-top: 32px;
			}
			.hero-stat {
				text-align: center;
				padding: 0 20px;
				border-right: 1px solid rgba(255, 255, 255, 0.08);
			}
			.hero-stat:last-child {
				border-right: none;
			}
			.hero-stat b {
				font-family: "Bebas Neue", cursive;
				font-size: 38px;
				color: var(--gold);
				display: block;
				line-height: 1;
			}
			.hero-stat span {
				font-size: 11px;
				color: var(--gray-500);
				text-transform: uppercase;
				letter-spacing: 2px;
				font-weight: 600;
			}
			.booking-wrap {
				max-width: 980px;
				margin: 0 auto;
				padding: 52px 24px 100px;
			}
			.section-head {
				margin-bottom: 32px;
			}
			.section-head h2 {
				font-family: "Bebas Neue", cursive;
				font-size: 34px;
				letter-spacing: 2px;
			}
			.section-head p {
				font-size: 13px;
				color: var(--gray-500);
				margin-top: 4px;
				font-weight: 500;
			}
			.progress {
				display: flex;
				margin-bottom: 44px;
				border: 1.5px solid var(--gray-200);
				border-radius: var(--rlg);
				overflow: hidden;
			}
			.prog-step {
				flex: 1;
				padding: 14px 12px;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 3px;
				transition: background 0.2s;
				border-right: 1.5px solid var(--gray-200);
				position: relative;
				background: var(--white);
			}
			.prog-step:last-child {
				border-right: none;
			}
			.prog-step.active {
				background: var(--black);
			}
			.prog-step.done {
				background: var(--gray-50);
			}
			.prog-n {
				font-family: "Bebas Neue", cursive;
				font-size: 24px;
				line-height: 1;
				color: var(--gray-300);
				transition: color 0.2s;
			}
			.prog-step.active .prog-n {
				color: var(--red);
			}
			.prog-lbl {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 10px;
				font-weight: 700;
				letter-spacing: 1.5px;
				text-transform: uppercase;
				color: var(--gray-400);
				transition: color 0.2s;
			}
			.prog-step.active .prog-lbl {
				color: rgba(255, 255, 255, 0.7);
			}
			.prog-tick {
				position: absolute;
				top: 8px;
				right: 8px;
				width: 16px;
				height: 16px;
				background: var(--red);
				border-radius: 50%;
				font-size: 9px;
				color: #fff;
				display: none;
				align-items: center;
				justify-content: center;
				font-weight: 700;
			}
			.prog-step.done .prog-tick {
				display: flex;
			}
			.step-panel {
				display: none;
				animation: fadeUp 0.3s ease;
			}
			.step-panel.active {
				display: block;
			}
			@keyframes fadeUp {
				from {
					opacity: 0;
					transform: translateY(10px);
				}
				to {
					opacity: 1;
					transform: none;
				}
			}
			.skeleton {
				background: linear-gradient(
					90deg,
					var(--gray-100) 25%,
					var(--gray-200) 50%,
					var(--gray-100) 75%
				);
				background-size: 200% 100%;
				animation: shimmer 1.4s infinite;
				border-radius: var(--rlg);
				height: 120px;
				margin-bottom: 14px;
			}
			@keyframes shimmer {
				0% {
					background-position: 200% 0;
				}
				100% {
					background-position: -200% 0;
				}
			}
			.barbers-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
				gap: 14px;
			}
			.barber-card {
				border: 1.5px solid var(--gray-200);
				border-radius: var(--rlg);
				padding: 22px;
				cursor: pointer;
				transition: all 0.2s;
				background: var(--white);
				position: relative;
				overflow: hidden;
			}
			.barber-card::before {
				content: "";
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 3px;
				background: var(--gray-200);
				transition: background 0.2s;
			}
			.barber-card:hover {
				border-color: var(--gray-900);
				transform: translateY(-2px);
			}
			.barber-card:hover::before {
				background: var(--gray-900);
			}
			.barber-card.selected {
				border-color: var(--red);
			}
			.barber-card.selected::before {
				background: var(--red);
			}
			.bc-top {
				display: flex;
				align-items: center;
				gap: 14px;
				margin-bottom: 14px;
			}
			.bc-avatar {
				width: 60px;
				height: 60px;
				border-radius: 50%;
				display: flex;
				align-items: center;
				justify-content: center;
				font-family: "Bebas Neue", cursive;
				font-size: 22px;
				color: var(--white);
				flex-shrink: 0;
				border: 2.5px solid var(--gray-200);
				transition: border-color 0.2s;
			}
			.barber-card.selected .bc-avatar {
				border-color: var(--red);
			}
			.bc-name {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 20px;
				font-weight: 700;
			}
			.bc-role {
				font-size: 12px;
				color: var(--gray-500);
				font-weight: 500;
				margin-top: 2px;
			}
			.bc-stars {
				display: flex;
				align-items: center;
				gap: 4px;
				font-size: 12px;
				font-weight: 600;
				color: var(--gold);
			}
			.bc-stars em {
				color: var(--gray-500);
				font-style: normal;
				font-weight: 400;
			}
			.bc-tags {
				display: flex;
				gap: 6px;
				flex-wrap: wrap;
				margin-top: 10px;
			}
			.bc-tag {
				font-size: 11px;
				font-weight: 600;
				font-family: "Barlow Condensed", sans-serif;
				letter-spacing: 0.5px;
				padding: 3px 10px;
				border-radius: 20px;
				background: var(--gray-100);
				color: var(--gray-700);
			}
			.barber-card.selected .bc-tag {
				background: #ffe5e7;
				color: var(--red);
			}
			.bc-badge {
				position: absolute;
				top: 12px;
				right: 12px;
				background: var(--gold);
				color: var(--black);
				font-family: "Barlow Condensed", sans-serif;
				font-size: 10px;
				font-weight: 700;
				letter-spacing: 1px;
				text-transform: uppercase;
				padding: 3px 9px;
				border-radius: 20px;
			}
			.services-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
				gap: 12px;
			}
			.svc-card {
				border: 1.5px solid var(--gray-200);
				border-radius: var(--rlg);
				padding: 16px 18px;
				cursor: pointer;
				transition: all 0.2s;
				display: flex;
				align-items: center;
				gap: 14px;
				background: var(--white);
			}
			.svc-card:hover {
				border-color: var(--black);
			}
			.svc-card.selected {
				border-color: var(--red);
				background: #fff7f7;
			}
			.svc-ico {
				width: 46px;
				height: 46px;
				border-radius: var(--r);
				background: var(--gray-100);
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 22px;
				flex-shrink: 0;
				transition: background 0.2s;
			}
			.svc-card.selected .svc-ico {
				background: var(--red);
			}
			.svc-info {
				flex: 1;
			}
			.svc-name {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 16px;
				font-weight: 700;
			}
			.svc-dur {
				font-size: 11px;
				color: var(--gray-500);
				font-weight: 500;
				margin-top: 2px;
			}
			.svc-price {
				font-family: "Bebas Neue", cursive;
				font-size: 24px;
				flex-shrink: 0;
				transition: color 0.2s;
			}
			.svc-card.selected .svc-price {
				color: var(--red);
			}
			.cal-wrap {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 20px;
			}
			@media (max-width: 620px) {
				.cal-wrap {
					grid-template-columns: 1fr;
				}
			}
			.cal-box,
			.slots-box {
				border: 1.5px solid var(--gray-200);
				border-radius: var(--rlg);
				padding: 20px;
				background: var(--white);
			}
			.cal-nav-row {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 16px;
			}
			.cal-month-lbl {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 17px;
				font-weight: 700;
				letter-spacing: 1px;
				text-transform: uppercase;
			}
			.cal-arr {
				width: 32px;
				height: 32px;
				border: 1.5px solid var(--gray-200);
				border-radius: var(--r);
				background: none;
				cursor: pointer;
				font-size: 14px;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.2s;
			}
			.cal-arr:hover {
				border-color: var(--black);
				background: var(--black);
				color: var(--white);
			}
			.cal-grid {
				display: grid;
				grid-template-columns: repeat(7, 1fr);
				gap: 3px;
			}
			.cal-dlbl {
				text-align: center;
				font-size: 10px;
				font-weight: 700;
				letter-spacing: 1px;
				text-transform: uppercase;
				color: var(--gray-400);
				padding: 4px 0 8px;
			}
			.cal-d {
				aspect-ratio: 1;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 13px;
				font-weight: 500;
				border-radius: var(--r);
				cursor: pointer;
				border: 1.5px solid transparent;
				transition: all 0.15s;
				position: relative;
			}
			.cal-d:hover:not(.empty):not(.past) {
				background: var(--gray-100);
				border-color: var(--gray-300);
			}
			.cal-d.today {
				border-color: var(--red);
				color: var(--red);
				font-weight: 700;
			}
			.cal-d.selected {
				background: var(--black);
				color: var(--white);
				border-color: var(--black);
			}
			.cal-d.today.selected {
				background: var(--red);
				border-color: var(--red);
			}
			.cal-d.past {
				color: var(--gray-300);
				cursor: not-allowed;
			}
			.slots-title {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 14px;
				font-weight: 700;
				letter-spacing: 1.5px;
				text-transform: uppercase;
				color: var(--gray-500);
				margin-bottom: 14px;
			}
			.slots-grid {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				gap: 7px;
			}
			.slot {
				padding: 10px 6px;
				text-align: center;
				border: 1.5px solid var(--gray-200);
				border-radius: var(--r);
				cursor: pointer;
				font-size: 13px;
				font-weight: 600;
				transition: all 0.15s;
				background: var(--white);
			}
			.slot:hover:not(.busy) {
				border-color: var(--black);
				background: var(--gray-50);
			}
			.slot.selected {
				background: var(--black);
				color: var(--white);
				border-color: var(--black);
			}
			.slot.busy {
				background: var(--gray-50);
				color: var(--gray-300);
				cursor: not-allowed;
				text-decoration: line-through;
				border-color: transparent;
			}
			.slots-empty,
			.slots-loading {
				text-align: center;
				padding: 32px 0;
				color: var(--gray-400);
				font-size: 13px;
			}
			.form-grid {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 14px;
			}
			@media (max-width: 520px) {
				.form-grid {
					grid-template-columns: 1fr;
				}
			}
			.fg {
				display: flex;
				flex-direction: column;
				gap: 7px;
			}
			.fg.full {
				grid-column: 1/-1;
			}
			.fg label {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 11px;
				font-weight: 700;
				letter-spacing: 1.5px;
				text-transform: uppercase;
				color: var(--gray-700);
			}
			.fg input,
			.fg textarea {
				padding: 12px 14px;
				border: 1.5px solid var(--gray-200);
				border-radius: var(--r);
				font-family: "Barlow", sans-serif;
				font-size: 15px;
				color: var(--black);
				background: var(--white);
				transition: border-color 0.2s;
				width: 100%;
			}
			.fg input:focus,
			.fg textarea:focus {
				outline: none;
				border-color: var(--black);
			}
			.fg textarea {
				min-height: 75px;
				resize: vertical;
			}
			.form-alert {
				background: #fffbea;
				border: 1.5px solid var(--gold);
				border-radius: var(--r);
				padding: 12px 16px;
				font-size: 13px;
				color: var(--gray-700);
				margin-top: 4px;
				display: flex;
				gap: 8px;
				align-items: flex-start;
				line-height: 1.5;
			}
			.summ-card {
				background: var(--gray-50);
				border: 1.5px solid var(--gray-200);
				border-radius: var(--rlg);
				padding: 24px;
				margin-bottom: 24px;
			}
			.summ-title {
				font-family: "Bebas Neue", cursive;
				font-size: 20px;
				letter-spacing: 1.5px;
				margin-bottom: 18px;
			}
			.summ-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 10px 0;
				border-bottom: 1px solid var(--gray-200);
				font-size: 14px;
			}
			.summ-row:last-child {
				border-bottom: none;
			}
			.summ-key {
				color: var(--gray-500);
				font-weight: 500;
			}
			.summ-val {
				font-weight: 700;
			}
			.summ-total {
				font-family: "Bebas Neue", cursive;
				font-size: 30px;
				color: var(--red);
			}
			.btn-primary {
				font-family: "Bebas Neue", cursive;
				font-size: 20px;
				letter-spacing: 2px;
				background: var(--red);
				color: var(--white);
				border: none;
				padding: 16px 36px;
				border-radius: var(--r);
				cursor: pointer;
				transition: all 0.2s;
				display: inline-flex;
				align-items: center;
				gap: 10px;
				width: 100%;
				justify-content: center;
			}
			.btn-primary:hover {
				background: var(--red-dark);
				transform: translateY(-1px);
			}
			.btn-primary:disabled {
				background: var(--gray-200);
				color: var(--gray-400);
				cursor: not-allowed;
				transform: none;
			}
			.btn-sec {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 13px;
				font-weight: 700;
				letter-spacing: 1.5px;
				text-transform: uppercase;
				background: transparent;
				color: var(--gray-500);
				border: 1.5px solid var(--gray-200);
				padding: 12px 22px;
				border-radius: var(--r);
				cursor: pointer;
				transition: all 0.2s;
				display: inline-flex;
				align-items: center;
				gap: 8px;
			}
			.btn-sec:hover {
				border-color: var(--black);
				color: var(--black);
			}
			.btn-row {
				display: flex;
				gap: 12px;
				margin-top: 24px;
			}
			.btn-row .btn-primary {
				flex: 2;
			}
			.btn-row .btn-sec {
				flex: 1;
			}
			.toast {
				position: fixed;
				bottom: 24px;
				left: 50%;
				transform: translateX(-50%) translateY(100px);
				background: var(--black);
				color: var(--white);
				padding: 12px 24px;
				border-radius: var(--r);
				font-size: 14px;
				font-weight: 600;
				z-index: 999;
				transition: transform 0.3s;
				white-space: nowrap;
				pointer-events: none;
			}
			.toast.show {
				transform: translateX(-50%) translateY(0);
			}
			.toast.error {
				background: var(--red);
			}
			.success-screen {
				text-align: center;
				padding: 72px 24px;
				display: none;
			}
			.success-icon {
				width: 80px;
				height: 80px;
				background: var(--black);
				border-radius: 50%;
				margin: 0 auto 24px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 38px;
			}
			.success-h {
				font-family: "Bebas Neue", cursive;
				font-size: 54px;
				letter-spacing: 2px;
				line-height: 0.95;
				margin-bottom: 12px;
			}
			.success-h em {
				color: var(--red);
				font-style: normal;
			}
			.success-p {
				font-size: 15px;
				color: var(--gray-500);
				max-width: 380px;
				margin: 0 auto 32px;
				line-height: 1.6;
			}
			.btn-wa {
				background: #25d366;
				color: var(--white);
				font-family: "Bebas Neue", cursive;
				font-size: 20px;
				letter-spacing: 2px;
				border: none;
				padding: 16px 40px;
				border-radius: var(--r);
				cursor: pointer;
				display: inline-flex;
				align-items: center;
				gap: 12px;
				transition: all 0.2s;
			}
			.btn-wa:hover {
				background: #1ebe55;
				transform: translateY(-1px);
			}
			.success-card {
				background: var(--gray-50);
				border: 1.5px solid var(--gray-200);
				border-radius: var(--rlg);
				padding: 20px;
				max-width: 360px;
				margin: 28px auto 0;
				text-align: left;
			}
			.overlay {
				position: fixed;
				inset: 0;
				background: rgba(0, 0, 0, 0.75);
				z-index: 500;
				display: none;
				align-items: center;
				justify-content: center;
				padding: 20px;
			}
			.overlay.open {
				display: flex;
			}
			.modal {
				background: var(--white);
				border-radius: var(--rlg);
				width: 100%;
				max-width: 440px;
				overflow: hidden;
				animation: slideUp 0.3s ease;
			}
			@keyframes slideUp {
				from {
					transform: translateY(24px);
					opacity: 0;
				}
				to {
					transform: none;
					opacity: 1;
				}
			}
			.modal-head {
				background: var(--black);
				padding: 28px 32px;
				position: relative;
			}
			.modal-head h2 {
				font-family: "Bebas Neue", cursive;
				font-size: 34px;
				color: var(--white);
				letter-spacing: 2px;
				line-height: 1;
			}
			.modal-head p {
				font-size: 13px;
				color: var(--gray-500);
				margin-top: 5px;
			}
			.modal-head .red-line {
				position: absolute;
				bottom: 0;
				left: 0;
				right: 0;
				height: 2px;
				background: var(--red);
			}
			.modal-x {
				position: absolute;
				top: 14px;
				right: 14px;
				background: var(--gray-900);
				border: none;
				color: var(--gray-500);
				width: 32px;
				height: 32px;
				border-radius: 50%;
				cursor: pointer;
				font-size: 18px;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: all 0.2s;
			}
			.modal-x:hover {
				background: var(--red);
				color: var(--white);
			}
			.modal-body {
				padding: 28px 32px;
			}
			.social-btns {
				display: flex;
				flex-direction: column;
				gap: 10px;
				margin-bottom: 20px;
			}
			.social-btn {
				display: flex;
				align-items: center;
				gap: 12px;
				padding: 13px 18px;
				border: 1.5px solid var(--gray-200);
				border-radius: var(--r);
				cursor: pointer;
				background: var(--white);
				font-size: 14px;
				font-weight: 600;
				color: var(--black);
				transition: all 0.2s;
				width: 100%;
			}
			.social-btn:hover {
				border-color: var(--black);
				background: var(--gray-50);
			}
			.social-btn svg {
				width: 20px;
				height: 20px;
				flex-shrink: 0;
			}
			.divider {
				display: flex;
				align-items: center;
				gap: 12px;
				margin: 18px 0;
				font-size: 12px;
				color: var(--gray-400);
				font-weight: 500;
			}
			.divider::before,
			.divider::after {
				content: "";
				flex: 1;
				height: 1px;
				background: var(--gray-200);
			}
			.mig {
				display: flex;
				flex-direction: column;
				gap: 7px;
				margin-bottom: 14px;
			}
			.mig label {
				font-family: "Barlow Condensed", sans-serif;
				font-size: 11px;
				font-weight: 700;
				letter-spacing: 1.5px;
				text-transform: uppercase;
				color: var(--gray-700);
			}
			.mig input {
				padding: 12px 14px;
				border: 1.5px solid var(--gray-200);
				border-radius: var(--r);
				font-family: "Barlow", sans-serif;
				font-size: 15px;
				color: var(--black);
				transition: border-color 0.2s;
				width: 100%;
			}
			.mig input:focus {
				outline: none;
				border-color: var(--black);
			}
			.login-error {
				font-size: 12px;
				color: var(--red);
				margin-top: 6px;
				display: none;
			}
			footer {
				background: var(--gray-900);
				color: var(--gray-500);
				text-align: center;
				padding: 32px 24px;
				font-size: 12px;
			}
			footer strong {
				color: var(--gray-300);
				font-weight: 600;
			}
		`;
