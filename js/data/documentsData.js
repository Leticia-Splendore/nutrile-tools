export const documentsLibrary = [
  {
    id: 'guias',
    label: 'Guias',
    icon: 'fa-solid fa-book-open',
    items: [
      {
        id: 'guia-lista-compras',
        title: 'Guia de lista de compras',
        description: 'Checklist simples para organizar a semana alimentar.',
        type: 'pdf',
        openMode: 'new-tab',
        href: './files/guia-lista-de-compras.pdf',
        downloadName: 'guia-lista-de-compras.pdf',
      },
      {
        id: 'guia-planejamento',
        title: 'Planejamento semanal',
        description: 'Material com organização de refeições e preparo.',
        type: 'pdf',
        openMode: 'new-tab',
        href: './files/planejamento-semanal.pdf',
        downloadName: 'planejamento-semanal.pdf',
      },
    ],
  },
  {
    id: 'receitas',
    label: 'Receitas',
    icon: 'fa-solid fa-utensils',
    items: [
      {
        id: 'ebook-cafe-manha',
        title: 'Ideias para café da manhã',
        description: 'PDF com sugestões práticas e fáceis.',
        type: 'pdf',
        openMode: 'new-tab',
        href: './files/ideias-cafe-da-manha.pdf',
        downloadName: 'ideias-cafe-da-manha.pdf',
      },
      {
        id: 'receita-lanche',
        title: 'Lanches rápidos',
        description: 'Arquivo com combinações leves para rotina corrida.',
        type: 'pdf',
        openMode: 'new-tab',
        href: './files/lanches-rapidos.pdf',
        downloadName: 'lanches-rapidos.pdf',
      },
    ],
  },
  {
    id: 'links',
    label: 'Links úteis',
    icon: 'fa-solid fa-link',
    items: [
      {
        id: 'instagram',
        title: 'Instagram',
        description: 'Abrir perfil para mais conteúdos.',
        type: 'external',
        openMode: 'new-tab',
        href: 'https://www.instagram.com/nutri.lesplendore/',
      },
    ],
  },
];
