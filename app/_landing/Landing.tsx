"use client";

import { useEffect, useRef } from "react";
import { LANDING_HTML } from "./markup";
import "./landing.css";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "593990000000";

export default function Landing() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanups: Array<() => void> = [];

    /* ---- Nav: estado al hacer scroll ---- */
    const nav = root.querySelector<HTMLElement>("#nav");
    const onScrollNav = () =>
      nav?.classList.toggle("scrolled", window.scrollY > 30);
    window.addEventListener("scroll", onScrollNav, { passive: true });
    onScrollNav();
    cleanups.push(() => window.removeEventListener("scroll", onScrollNav));

    /* ---- Hero: animación de entrada (load ya pudo dispararse) ---- */
    const hero = root.querySelector<HTMLElement>("#hero");
    requestAnimationFrame(() => hero?.classList.add("loaded"));

    /* ---- Reveal on scroll ---- */
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const d = parseInt(
              (e.target as HTMLElement).dataset.delay || "0",
              10,
            );
            setTimeout(() => e.target.classList.add("in"), d);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    root
      .querySelectorAll(".reveal,.reveal-scale,.reveal-left,.reveal-right")
      .forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    /* ---- Contadores animados ---- */
    const counterIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = +(el.dataset.target || "0");
          const dur = 1600;
          const t0 = performance.now();
          const fmt = (n: number) => n.toLocaleString("es-EC");
          const tick = (now: number) => {
            const p = Math.min((now - t0) / dur, 1);
            el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 4))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          counterIO.unobserve(el);
        });
      },
      { threshold: 0.6 },
    );
    root.querySelectorAll(".counter").forEach((el) => counterIO.observe(el));
    cleanups.push(() => counterIO.disconnect());

    /* ---- Marquee: duplicar contenido ---- */
    const mq = root.querySelector<HTMLElement>("#marquee");
    if (mq && !mq.dataset.dup) {
      mq.innerHTML += mq.innerHTML;
      mq.dataset.dup = "1";
    }

    /* ---- Parallax sutil ---- */
    const phone = root.querySelector<HTMLElement>("#heroPhone");
    const chips = root.querySelectorAll<HTMLElement>(".float-chip");
    const parallaxEls = root.querySelectorAll<HTMLElement>("[data-parallax]");
    let ticking = false;
    const onScrollParallax = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (phone && y < 900) {
          phone.style.transform = `translate(-50%,-50%) rotate(-3deg) translateY(${y * 0.05}px)`;
          chips.forEach(
            (c, i) => (c.style.transform = `translateY(${y * (0.09 + i * 0.03)}px)`),
          );
        }
        parallaxEls.forEach((el) => {
          const sc = el.closest(".showcase");
          if (!sc) return;
          const r = sc.getBoundingClientRect();
          const prog = (window.innerHeight - r.top) / (window.innerHeight + r.height);
          if (prog > 0 && prog < 1) {
            const f = parseFloat(el.dataset.parallax || "0");
            el.style.translate = `0 ${(prog - 0.5) * 100 * f * -10}px`;
          }
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScrollParallax, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScrollParallax));

    /* ---- FAQ acordeón ---- */
    root.querySelectorAll<HTMLElement>(".faq-item").forEach((item) => {
      const q = item.querySelector<HTMLElement>(".faq-q");
      const a = item.querySelector<HTMLElement>(".faq-a");
      if (!q || !a) return;
      const setH = () => {
        a.style.maxHeight = item.classList.contains("open")
          ? a.scrollHeight + "px"
          : "0";
      };
      setH();
      q.addEventListener("click", () => {
        root.querySelectorAll(".faq-item.open").forEach((o) => {
          if (o !== item) {
            o.classList.remove("open");
            const oa = o.querySelector<HTMLElement>(".faq-a");
            if (oa) oa.style.maxHeight = "0";
          }
        });
        item.classList.toggle("open");
        setH();
      });
    });

    /* ---- Footer: wordmark gigante ---- */
    const gw = root.querySelector<HTMLElement>("#giantWord");
    if (gw) {
      const gwIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              gw.classList.add("in");
              gw.querySelectorAll<HTMLElement>("span").forEach(
                (s, i) => (s.style.transitionDelay = `${i * 70}ms`),
              );
              gwIO.unobserve(gw);
            }
          });
        },
        { threshold: 0.3 },
      );
      gwIO.observe(gw);
      cleanups.push(() => gwIO.disconnect());
    }

    /* ============ MODALES DE CAPTURA ============ */
    const modals: Record<string, HTMLElement | null> = {
      cliente: root.querySelector("#modal-cliente"),
      pro: root.querySelector("#modal-pro"),
    };
    const openModal = (type: string) => {
      const m = modals[type];
      if (!m) return;
      m.classList.add("open");
      document.body.style.overflow = "hidden";
      setTimeout(
        () => m.querySelector<HTMLElement>("input,select")?.focus(),
        350,
      );
    };
    const closeModal = (m: Element) => {
      m.classList.remove("open");
      document.body.style.overflow = "";
      setTimeout(() => m.querySelector(".modal")?.classList.remove("done"), 350);
    };

    root.querySelectorAll<HTMLElement>("[data-modal]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openModal(btn.dataset.modal!);
      });
    });
    root.querySelectorAll<HTMLElement>(".modal-overlay").forEach((ov) => {
      ov.addEventListener("click", (e) => {
        const t = e.target as HTMLElement;
        if (t === ov || t.closest("[data-close]")) closeModal(ov);
      });
    });
    root.querySelectorAll<HTMLElement>("[data-switch]").forEach((a) => {
      a.addEventListener("click", () => {
        const open = root.querySelector(".modal-overlay.open");
        if (open) closeModal(open);
        setTimeout(() => openModal(a.dataset.switch!), 360);
      });
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const o = root.querySelector(".modal-overlay.open");
        if (o) closeModal(o);
      }
    };
    document.addEventListener("keydown", onKey);
    cleanups.push(() => document.removeEventListener("keydown", onKey));

    const buildWa = (type: string, d: Record<string, string>) => {
      if (type === "cliente") {
        return (
          `¡Hola TaskYa! 👋 Busco un servicio:%0A%0A` +
          `*Nombre:* ${d.nombre}%0A*Ciudad:* ${d.ciudad}%0A*Categoría:* ${d.categoria}%0A` +
          (d.detalle ? `*Detalle:* ${d.detalle}%0A` : ``) +
          `%0AQuedo atento(a). ¡Gracias!`
        );
      }
      return (
        `¡Hola TaskYa! 🤝 Quiero ofrecer mis servicios:%0A%0A` +
        `*Nombre:* ${d.nombre}%0A*Profesión:* ${d.profesion}%0A*Ciudad:* ${d.ciudad}%0A` +
        (d.experiencia ? `*Experiencia:* ${d.experiencia}%0A` : ``) +
        (d.portafolio ? `*Portafolio:* ${d.portafolio}%0A` : ``) +
        `%0A¿Cómo me inscribo? ¡Gracias!`
      );
    };

    root.querySelectorAll<HTMLFormElement>("form[data-form]").forEach((form) => {
      const type = form.dataset.form!;
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        let ok = true;
        form.querySelectorAll<HTMLInputElement>("[required]").forEach((inp) => {
          const f = inp.closest(".field");
          if (!inp.value.trim()) {
            f?.classList.add("error");
            ok = false;
          } else f?.classList.remove("error");
        });
        if (!ok) return;

        const data = Object.fromEntries(
          new FormData(form).entries(),
        ) as Record<string, string>;
        const btn = form.querySelector<HTMLButtonElement>(
          "button[type=submit]",
        )!;
        const original = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Enviando...";

        try {
          await fetch("/api/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, ...data }),
          });
        } catch {
          /* si falla, igual seguimos a WhatsApp */
        }

        form.closest(".modal")?.classList.add("done");
        btn.disabled = false;
        btn.textContent = original;
        const wa = `https://wa.me/${WHATSAPP}?text=${buildWa(type, data)}`;
        setTimeout(() => window.open(wa, "_blank"), 650);
      });
      form.querySelectorAll("input,select,textarea").forEach((inp) => {
        inp.addEventListener("input", () =>
          inp.closest(".field")?.classList.remove("error"),
        );
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <div ref={ref} dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
  );
}
