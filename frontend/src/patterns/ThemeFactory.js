/**
 * PATRÓN ABSTRACT FACTORY — Temas Visuales (Light / Dark)
 *
 * Problema: La aplicación soporta dos temas (claro y oscuro). Cada tema
 * necesita una familia coherente de colores: fondos, textos, cards,
 * bordes, botones primarios, etc. Cambiar el tema implica reemplazar
 * toda esa familia de forma consistente.
 *
 * Solución: Definir una fábrica abstracta (ThemeFactory) con métodos
 * para crear cada "pieza" del tema. Dos fábricas concretas
 * (LightThemeFactory y DarkThemeFactory) producen familias compatibles.
 * El consumidor (ThemeContext) solo conoce la interfaz abstracta.
 *
 * Estructura:
 *   ThemeFactory (abstracta)
 *       ├── LightThemeFactory  → Colores claros, sombras suaves
 *       └── DarkThemeFactory   → Colores oscuros, sombras profundas
 *
 * Cada factory produce:
 *   - colors      → paleta completa de colores CSS
 *   - typography  → pesos y tamaños de fuente
 *   - shadows     → sombras de elevación
 *   - components  → estilos base para componentes específicos
 */

// ─── Fábrica abstracta ────────────────────────────────────────────────────────
class ThemeFactory {
  createColors()     { throw new Error('createColors() no implementado'); }
  createShadows()    { throw new Error('createShadows() no implementado'); }
  createComponents() { throw new Error('createComponents() no implementado'); }

  /**
   * Template method: ensambla el tema completo llamando a los métodos abstractos.
   */
  buildTheme() {
    const name = this.constructor.name.replace('ThemeFactory', '').toLowerCase();
    console.log(`🎨 [Abstract Factory] Construyendo tema: "${name}"`);
    return {
      name,
      colors:     this.createColors(),
      shadows:    this.createShadows(),
      components: this.createComponents(),
    };
  }
}

// ─── Fábrica concreta: Tema Claro ─────────────────────────────────────────────
class LightThemeFactory extends ThemeFactory {
  createColors() {
    return {
      // Fondos
      bgPrimary:    '#F8FAFC',
      bgSecondary:  '#FFFFFF',
      bgTertiary:   '#F1F5F9',
      bgHover:      '#E2E8F0',
      // Textos
      textPrimary:  '#0F172A',
      textSecondary:'#475569',
      textMuted:    '#94A3B8',
      textInverse:  '#FFFFFF',
      // Bordes
      border:       '#E2E8F0',
      borderHover:  '#CBD5E1',
      // Acento / Brand
      accent:       '#6366F1',
      accentHover:  '#4F46E5',
      accentLight:  '#EEF2FF',
      // Estados
      success:      '#10B981',
      successLight: '#D1FAE5',
      warning:      '#F59E0B',
      warningLight: '#FEF3C7',
      error:        '#EF4444',
      errorLight:   '#FEE2E2',
      info:         '#3B82F6',
      infoLight:    '#DBEAFE',
      // Kanban
      columnBg:     '#F1F5F9',
      cardBg:       '#FFFFFF',
    };
  }

  createShadows() {
    return {
      sm:  '0 1px 2px 0 rgba(0,0,0,0.05)',
      md:  '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
      lg:  '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
      xl:  '0 20px 25px -5px rgba(0,0,0,0.08)',
    };
  }

  createComponents() {
    return {
      navbar:   { bg: '#FFFFFF', borderBottom: '1px solid #E2E8F0' },
      sidebar:  { bg: '#F8FAFC', borderRight: '1px solid #E2E8F0' },
      card:     { bg: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' },
      input:    { bg: '#FFFFFF', border: '1px solid #CBD5E1', focusBorder: '#6366F1' },
      badge:    { borderRadius: '6px', fontWeight: '600', fontSize: '11px' },
      button: {
        primary: { bg: '#6366F1', color: '#FFFFFF', hover: '#4F46E5' },
        secondary: { bg: '#F1F5F9', color: '#475569', hover: '#E2E8F0' },
        danger:  { bg: '#EF4444', color: '#FFFFFF', hover: '#DC2626' },
      },
    };
  }
}

// ─── Fábrica concreta: Tema Oscuro ────────────────────────────────────────────
class DarkThemeFactory extends ThemeFactory {
  createColors() {
    return {
      // Fondos
      bgPrimary:    '#0F172A',
      bgSecondary:  '#1E293B',
      bgTertiary:   '#162032',
      bgHover:      '#334155',
      // Textos
      textPrimary:  '#F1F5F9',
      textSecondary:'#94A3B8',
      textMuted:    '#64748B',
      textInverse:  '#0F172A',
      // Bordes
      border:       '#1E293B',
      borderHover:  '#334155',
      // Acento / Brand
      accent:       '#818CF8',
      accentHover:  '#6366F1',
      accentLight:  '#1E1B4B',
      // Estados
      success:      '#34D399',
      successLight: '#064E3B',
      warning:      '#FBBF24',
      warningLight: '#451A03',
      error:        '#F87171',
      errorLight:   '#450A0A',
      info:         '#60A5FA',
      infoLight:    '#1E3A5F',
      // Kanban
      columnBg:     '#162032',
      cardBg:       '#1E293B',
    };
  }

  createShadows() {
    return {
      sm:  '0 1px 2px 0 rgba(0,0,0,0.3)',
      md:  '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)',
      lg:  '0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -2px rgba(0,0,0,0.3)',
      xl:  '0 20px 25px -5px rgba(0,0,0,0.6)',
    };
  }

  createComponents() {
    return {
      navbar:   { bg: '#1E293B', borderBottom: '1px solid #334155' },
      sidebar:  { bg: '#0F172A', borderRight: '1px solid #1E293B' },
      card:     { bg: '#1E293B', border: '1px solid #334155', borderRadius: '12px' },
      input:    { bg: '#0F172A', border: '1px solid #334155', focusBorder: '#818CF8' },
      badge:    { borderRadius: '6px', fontWeight: '600', fontSize: '11px' },
      button: {
        primary: { bg: '#818CF8', color: '#0F172A', hover: '#6366F1' },
        secondary: { bg: '#334155', color: '#94A3B8', hover: '#475569' },
        danger:  { bg: '#F87171', color: '#0F172A', hover: '#EF4444' },
      },
    };
  }
}

// ─── Función de acceso ────────────────────────────────────────────────────────
/**
 * Retorna la fábrica de tema según el nombre solicitado.
 * El consumidor no necesita conocer las clases concretas.
 */
function getThemeFactory(themeName) {
  const factories = {
    light: LightThemeFactory,
    dark:  DarkThemeFactory,
  };
  const Factory = factories[themeName] || LightThemeFactory;
  return new Factory();
}

export { getThemeFactory, LightThemeFactory, DarkThemeFactory };
