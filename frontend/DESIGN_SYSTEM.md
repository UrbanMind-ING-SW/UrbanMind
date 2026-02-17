# UrbanMind Design System

Una guida completa per usare il nuovo sistema di variabili CSS organizzate gerarchicamente.

## 📋 Struttura dei Design Tokens

Le variabili CSS in `src/assets/main.css` sono organizzate in 7 categorie:

### 1. **COLOR PALETTE** - Base Colors
I colori di base del sistema, senza contesto semantico.

```css
/* Neutrals */
--color-white: #FFFFFF
--color-gray-50: #FFFFE5
--color-gray-100: #F9F9F9
--color-gray-300: #E5E5E5
--color-gray-500: #6A6A6A
--color-gray-700: #3d3d3d
--color-black: #000000

/* Primary - Blue */
--color-blue-300: #F0F4F8
--color-blue-500: #3483d3
--color-blue-700: #68aaeb

/* Secondary - Orange */
--color-orange-400: rgb(228, 134, 67)
--color-orange-600: #f36c0b

/* Status Colors */
--color-success: #10b981
--color-warning: #f59e0b
--color-danger: #ef4444
```

### 2. **SEMANTIC COLORS** - Component-Level

Variabili che hanno un significato semantico nei componenti.

```css
/* Background */
--color-background           /* Sfondo principale (bianco) */
--color-background-soft      /* Sfondo secondario (blu chiaro) */
--color-background-muted     /* Sfondo terziario */

/* Text */
--color-text                 /* Testo primario */
--color-text-secondary       /* Testo secondario */
--color-text-white           /* Testo su sfondo scuro */
--color-text-heading         /* Titoli e heading */

/* Borders */
--color-border               /* Bordi normali */
--color-border-hover         /* Bordi al hover */
--color-border-focus         /* Bordi su focus */

/* Interactive */
--color-accent               /* Colore primario (arancione) */
--color-accent-soft          /* Versione soft dell'accento */

/* Gradients */
--gradient-hero              /* Gradient per sezioni hero */
--gradient-card              /* Gradient per card */
```

### 3. **SPACING** - Layout Grid

Un sistema di spacing consistente basato su multipli di 4px.

```css
--spacing-2xs:  2px   /* 0.125rem */
--spacing-xs:   4px   /* 0.25rem */
--spacing-sm:   8px   /* 0.5rem */
--spacing-md:   12px  /* 0.75rem */
--spacing-lg:   16px  /* 1rem */
--spacing-xl:   18px  /* 1.125rem */
--spacing-2xl:  24px  /* 1.5rem */
--spacing-3xl:  32px  /* 2rem */
--spacing-4xl:  48px  /* 3rem */
--spacing-5xl:  64px  /* 4rem */
```

**Uso:**
```css
padding: var(--spacing-lg);
margin: var(--spacing-md) var(--spacing-lg);
gap: var(--spacing-sm);
```

### 4. **BORDER RADIUS** - Consistency

Valori di border-radius per mantenere coerenza visiva.

```css
--radius-xs:    6px      /* Input, piccoli elementi */
--radius-sm:    10px     /* Pulsanti */
--radius-md:    12px     /* Card standard */
--radius-lg:    14px     /* Card grandi */
--radius-xl:    16px     /* Elementi prominenti */
--radius-full:  9999px   /* Pill buttons */
```

### 5. **SHADOWS** - Depth & Elevation

Ombre per aggiungere profondità e gerarchia visiva.

```css
--shadow-sm:  0 2px 8px rgba(0, 0, 0, 0.08)         /* Sottile */
--shadow-md:  0 10px 22px rgba(0, 0, 0, 0.08)       /* Standard */
--shadow-lg:  0 12px 35px rgba(0, 0, 0, 0.35)       /* Prominente */
--shadow-xl:  0 20px 50px rgba(0, 0, 0, 0.15)       /* Massimo elevato */
```

**Uso:**
```css
box-shadow: var(--shadow-md);
```

### 6. **TRANSITIONS** - Animation

Durate di transizione standardizzate.

```css
--transition-fast:  0.12s ease-out  /* Feedback immediato */
--transition-base:  0.2s ease       /* Standard */
--transition-slow:  0.5s ease       /* Fade importanti */
```

### 7. **TYPOGRAPHY** - Text Styling

Variabili per mantenere coerenza tipografica.

```css
--font-family: Arial, Helvetica, sans-serif

/* Font Sizes */
--font-size-xs:     12px
--font-size-sm:     14px
--font-size-base:   15px
--font-size-lg:     18px
--font-size-xl:     24px
--font-size-2xl:    32px

/* Font Weights */
--font-weight-normal:  400
--font-weight-bold:    700
--font-weight-black:   800
```

---

## 🎨 Utility Classes

Nel CSS sono incluse utility classes riutilizzabili:

### Text Colors
```css
.text-primary       /* Colore heading */
.text-secondary     /* Colore testo secondario */
.text-muted         /* Colore attenuato */
.text-white         /* Testo bianco */
```

### Background
```css
.bg-primary         /* Background arancione */
.bg-secondary       /* Background blu chiaro */
.bg-white           /* Background bianco */
```

### Borders
```css
.border-light       /* Bordo standard */
.border-hover       /* Bordo hover */
```

### Shadows
```css
.shadow-sm          /* Ombra leggera */
.shadow-md          /* Ombra standard */
.shadow-lg          /* Ombra pronunciata */
```

### Border Radius
```css
.rounded-xs         /* 6px */
.rounded-sm         /* 10px */
.rounded-md         /* 12px */
.rounded-lg         /* 14px */
```

---

## 📝 Casi d'Uso Comuni

### 1. Card Component
```css
.my-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.my-card:hover {
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-hover);
}
```

### 2. Button Primary
```css
.btn-primary {
  background: var(--color-accent);
  color: var(--color-text-white);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-bold);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary:hover {
  background: var(--color-orange-600);
  box-shadow: var(--shadow-md);
}
```

### 3. Hero Section
```css
.hero {
  background: var(--gradient-hero);
  padding: var(--spacing-3xl);
  border-radius: var(--radius-lg);
  color: var(--color-text-white);
}

.hero h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-black);
  margin-bottom: var(--spacing-md);
}
```

### 4. Form Input
```css
.form-input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background: var(--color-background);
  transition: all var(--transition-base);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-border-hover);
  box-shadow: 0 0 0 3px var(--color-border-focus);
}
```

---

## ✨ Best Practices

### ✅ Fai questo
```css
/* Usa variabili semantiche */
background: var(--color-background-soft);
color: var(--color-text);
padding: var(--spacing-lg);
border-radius: var(--radius-md);
box-shadow: var(--shadow-md);
transition: all var(--transition-base);
```

### ❌ Non fare questo
```css
/* Valori hardcoded */
background: #F0F4F8;
color: #3d3d3d;
padding: 16px;
border-radius: 12px;
box-shadow: 0 10px 22px rgba(0, 0, 0, 0.08);
transition: all 0.2s ease;
```

### 📌 Guida Rapida

| Cosa vuoi? | Usa... |
|-----------|--------|
| Sfondo della pagina | `var(--color-background-soft)` |
| Testo primario | `var(--color-text)` |
| Testo su sfondo scuro | `var(--color-text-white)` |
| Titoli | `var(--color-text-heading)` |
| Bottone primario | `var(--color-accent)` |
| Bordo | `var(--color-border)` |
| Ombra leggera | `var(--shadow-sm)` |
| Spaziatura | `var(--spacing-lg)` |
| Border radius | `var(--radius-md)` |

---

## 🔄 Quando Aggiungere Nuove Variabili

Aggiungi una nuova variabile nel `main.css` SOLO se:

1. **È riutilizzata in 3+ posti** del codebase
2. **Ha un significato semantico** (non solo un colore random)
3. **Fa parte della palette ufficiale** del brand

Per variabili temporanee o component-specific, usa i colori direttamente nel componente Vue.

---

## 🚀 Vantaggi del Nuovo Sistema

✅ **Coerenza Visiva** - Tutto il progetto usa gli stessi colori, spacing, shadows  
✅ **Manutenibilità** - Cambi globali in un solo punto  
✅ **Skalabilità** - Facile aggiungere componenti nuovi  
✅ **Dark Mode Ready** - Pronto per implementare tema scuro (basta creare `:root.dark { ... }`)  
✅ **Performance** - Niente repeated CSS, puro riferimento variabili  
✅ **Accessibilità** - Valori di colore e contrasto coerenti  

---

**Ultima aggiornamento:** Febbraio 2026
