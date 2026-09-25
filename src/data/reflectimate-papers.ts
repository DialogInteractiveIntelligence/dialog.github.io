/**
 * Papers on the ReflectiMate project page (src/pages/projects/reflectimate.astro).
 *
 * Kept separate from src/data/publications.bib because that collection requires
 * full author metadata, which isn't available yet. Once a paper has real
 * authors/abstract/etc., move it into publications.bib (with `project:
 * reflectimate`) and delete it here — the page will keep working either way.
 *
 * To add a new paper: append an object to the array below. `contribution`,
 * `links` and `bibtex` are optional — omit a link if it doesn't exist yet,
 * and leave `contribution` undefined to show a TODO placeholder.
 */

export interface ReflectiMatePaper {
  id: string;
  title: string;
  venue: string;
  year: number;
  /** One-sentence summary of the paper's contribution. */
  contribution?: string;
  links?: {
    pdf?: string;
    arxiv?: string;
    code?: string;
  };
  /** BibTeX text for the "Copy BibTeX" button. Only known fields are filled in. */
  bibtex?: string;
}

export const reflectimatePapers: ReflectiMatePaper[] = [
  {
    id: 'reflectimate-umap-2026',
    title: 'Reflecti-Mate: A Conversational Agent for Adaptive Decision-Making Support Through System 1 and System 2 Thinking',
    venue: 'UMAP',
    year: 2026,
    contribution: 'An agent that models how a person spreads attention across internal, external and experiential considerations and adapts its questions to broaden and deepen reflection.',
    links: { pdf: 'https://doi.org/10.1145/3774935.3806176' },
    bibtex: `@inproceedings{tarvirdians2026reflectimate,
    author    = {Tarvirdians, Morita and Chandrasegaran, Senthil and Hung, Hayley and Jonker, Catholijn M. and Oertel, Catharine},
    title     = {Reflecti-Mate: A Conversational Agent for Adaptive Decision-Making Support Through System 1 and System 2 Thinking},
    booktitle = {Proceedings of the 34th ACM Conference on User Modeling, Adaptation and Personalization},
    series    = {UMAP '26},
    year      = {2026},
    pages     = {213--222},
    publisher = {ACM},
    doi       = {10.1145/3774935.3806176}
}`,
  },
  {
    id: 'why-this-not-that-emnlp-2026',
    title: 'Why This and Not That? A Collaborative Reflection Approach for Understanding Thought Coverage in Decision Making Support Dialog',
    venue: 'EMNLP Findings',
    year: 2026,
    contribution: 'The first empirical characterisation of the interpretive gap, with a 9-category taxonomy of the reasons people give for patterns an agent observes.',
    links: { arxiv: 'https://arxiv.org/abs/2608.17054' },
    bibtex: `@inproceedings{tarvirdians2026whythis,
    author    = {Tarvirdians, Morita and Hung, Hayley and Oertel, Catharine},
    title     = {Why This and Not That? A Collaborative Reflection Approach for Understanding Thought Coverage in Decision Making Support Dialog},
    booktitle = {Findings of the Association for Computational Linguistics: EMNLP 2026},
    year      = {2026}
}`,
  },
  {
    id: 'who-decides-when-to-move-on-2026',
    title: 'Who Decides When to Move On? Human and AI Steering Authority in Decision Making Support Dialog',
    venue: 'Under review',
    year: 2026,
    contribution: 'Compares agent-led and user-led steering of the same reflection agent, and shows that who steers changes how reflection unfolds more than where it ends.',
  },
];

