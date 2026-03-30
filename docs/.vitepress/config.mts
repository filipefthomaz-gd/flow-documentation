import { defineConfig } from 'vitepress'
import flowGrammar from './flow.tmLanguage.json'

export default defineConfig({
  title: 'Flow',
  description: 'A game-first dialogue scripting language',
  base: '/Flow/',

  markdown: {
    languages: [
      {
        ...flowGrammar,
        name: 'flow',
        aliases: ['flo'],
      } as any,
    ],
  },

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide',     link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/syntax' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started',   link: '/guide/getting-started' },
          { text: 'Writing Dialogue',  link: '/guide/writing-dialogue' },
          { text: 'Sequences',         link: '/guide/sequences' },
          { text: 'Narration',         link: '/guide/narration' },
          { text: 'Tunnel',            link: '/guide/tunnel' },
          { text: 'VS Code Features',  link: '/guide/vscode-features' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'Syntax',    link: '/reference/syntax' },
          { text: 'Keywords',  link: '/reference/keywords' },
          { text: 'Commands',  link: '/reference/commands' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/filipefthomaz-gd/Flow' },
    ],

    footer: {
      message: 'Flow — A game-first dialogue scripting language.',
    },

    search: {
      provider: 'local',
    },
  },
})
