import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(private title: Title, private meta: Meta) { }

  updateMetaTags(config: {
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
    canonicalUrl?: string;
  }) {
    // Update title
    if (config.title) {
      this.title.setTitle(config.title);
    }

    // Update meta description
    if (config.description) {
      this.meta.updateTag({ name: 'description', content: config.description });
    }

    // Update keywords
    if (config.keywords) {
      this.meta.updateTag({ name: 'keywords', content: config.keywords });
    }

    // Update Open Graph tags
    if (config.ogTitle) {
      this.meta.updateTag({ property: 'og:title', content: config.ogTitle });
    }
    if (config.ogDescription) {
      this.meta.updateTag({ property: 'og:description', content: config.ogDescription });
    }
    if (config.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: config.ogImage });
    }
    if (config.ogUrl) {
      this.meta.updateTag({ property: 'og:url', content: config.ogUrl });
    }

    // Update Twitter tags
    if (config.twitterTitle) {
      this.meta.updateTag({ name: 'twitter:title', content: config.twitterTitle });
    }
    if (config.twitterDescription) {
      this.meta.updateTag({ name: 'twitter:description', content: config.twitterDescription });
    }
    if (config.twitterImage) {
      this.meta.updateTag({ name: 'twitter:image', content: config.twitterImage });
    }

    // Update canonical URL
    if (config.canonicalUrl) {
      this.updateCanonicalUrl(config.canonicalUrl);
    }
  }

  private updateCanonicalUrl(url: string) {
    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical link
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.head.appendChild(link);
  }

  // Predefined SEO configurations for different pages
  getHomePageMeta() {
    return {
      title: 'MCQ Exam & Interview Preparer - AI-Powered Quiz Generator | Practice Tests Online',
      description: 'Free AI-powered MCQ exam preparation platform. Generate custom multiple-choice questions for any topic. Practice for interviews, exams, and certifications with instant feedback.',
      keywords: 'MCQ exam preparation, multiple choice questions, AI quiz generator, interview practice, online tests, exam prep, certification practice, educational quizzes',
      ogTitle: 'MCQ Exam & Interview Preparer - AI-Powered Quiz Generator',
      ogDescription: 'Free AI-powered MCQ exam preparation platform. Generate custom multiple-choice questions for any topic.',
      ogImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      ogUrl: 'https://www.ai-mcq-trainer.in/',
      twitterTitle: 'MCQ Exam & Interview Preparer - AI-Powered Quiz Generator',
      twitterDescription: 'Free AI-powered MCQ exam preparation platform. Generate custom multiple-choice questions for any topic.',
      twitterImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      canonicalUrl: 'https://www.ai-mcq-trainer.in/'
    };
  }

  getQuizPageMeta(topic: string) {
    const topicTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
    return {
      title: `${topicTitle} MCQ Quiz - Practice Test Online | MCQ Exam Preparer`,
      description: `Practice ${topicTitle} multiple choice questions online. Free AI-generated quiz for ${topicTitle} exam preparation with instant feedback and detailed explanations.`,
      keywords: `${topicTitle} MCQ, ${topicTitle} quiz, ${topicTitle} practice test, ${topicTitle} exam preparation, multiple choice questions ${topicTitle}`,
      ogTitle: `${topicTitle} MCQ Quiz - Practice Test Online`,
      ogDescription: `Practice ${topicTitle} multiple choice questions online. Free AI-generated quiz for ${topicTitle} exam preparation.`,
      ogImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      ogUrl: `https://www.ai-mcq-trainer.in/quiz/${topic}`,
      twitterTitle: `${topicTitle} MCQ Quiz - Practice Test Online`,
      twitterDescription: `Practice ${topicTitle} multiple choice questions online. Free AI-generated quiz for ${topicTitle} exam preparation.`,
      twitterImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      canonicalUrl: `https://www.ai-mcq-trainer.in/quiz/${topic}`
    };
  }

  getCbsePageMeta(classNumber?: string, subject?: string) {
    let title = 'CBSE MCQ Practice Tests - Class 6 to 12 | Free Online Quizzes';
    let description = 'Free CBSE curriculum MCQ practice tests for classes 6 to 12. Practice subjects like Mathematics, Science, Social Science, English with AI-generated questions.';
    let keywords = 'CBSE MCQ, CBSE practice tests, CBSE exam preparation, CBSE online quizzes, CBSE curriculum, CBSE class tests';
    let url = 'https://www.ai-mcq-trainer.in/cbse';

    if (classNumber) {
      title = `CBSE Class ${classNumber} MCQ Practice Tests | Free Online Quizzes`;
      description = `Free CBSE Class ${classNumber} MCQ practice tests. Practice all subjects with AI-generated questions and detailed explanations.`;
      keywords = `CBSE class ${classNumber}, CBSE ${classNumber} MCQ, CBSE ${classNumber} practice tests, CBSE ${classNumber} exam preparation`;
      url = `https://www.ai-mcq-trainer.in/cbse/${classNumber}/subjects`;
    }

    if (subject) {
      title = `CBSE Class ${classNumber} ${subject} MCQ Practice Tests | Free Online Quizzes`;
      description = `Free CBSE Class ${classNumber} ${subject} MCQ practice tests. Practice chapter-wise questions with AI-generated content and instant feedback.`;
      keywords = `CBSE ${subject}, CBSE class ${classNumber} ${subject}, ${subject} MCQ practice, CBSE ${subject} exam preparation`;
      url = `https://www.ai-mcq-trainer.in/cbse/${classNumber}/subjects/${subject}/chapters`;
    }

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      ogImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      ogUrl: url,
      twitterTitle: title,
      twitterDescription: description,
      twitterImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      canonicalUrl: url
    };
  }

  getAboutPageMeta() {
    return {
      title: 'About MCQ Exam & Interview Preparer - AI-Powered Learning Platform',
      description: 'Learn about MCQ Exam & Interview Preparer, an AI-powered platform for exam preparation and interview practice. Features include custom quiz generation, progress tracking, and comprehensive question database.',
      keywords: 'about MCQ trainer, AI exam preparation, interview practice platform, educational technology, quiz generator',
      ogTitle: 'About MCQ Exam & Interview Preparer - AI-Powered Learning Platform',
      ogDescription: 'Learn about MCQ Exam & Interview Preparer, an AI-powered platform for exam preparation and interview practice.',
      ogImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      ogUrl: 'https://www.ai-mcq-trainer.in/about',
      twitterTitle: 'About MCQ Exam & Interview Preparer - AI-Powered Learning Platform',
      twitterDescription: 'Learn about MCQ Exam & Interview Preparer, an AI-powered platform for exam preparation and interview practice.',
      twitterImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      canonicalUrl: 'https://www.ai-mcq-trainer.in/about'
    };
  }

  getContactPageMeta() {
    return {
      title: 'Contact MCQ Exam & Interview Preparer - Get Support & Feedback',
      description: 'Contact MCQ Exam & Interview Preparer team. Get support, provide feedback, or ask questions about our AI-powered exam preparation platform.',
      keywords: 'contact MCQ trainer, support, feedback, help, customer service',
      ogTitle: 'Contact MCQ Exam & Interview Preparer - Get Support & Feedback',
      ogDescription: 'Contact MCQ Exam & Interview Preparer team. Get support, provide feedback, or ask questions about our AI-powered exam preparation platform.',
      ogImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      ogUrl: 'https://www.ai-mcq-trainer.in/contact',
      twitterTitle: 'Contact MCQ Exam & Interview Preparer - Get Support & Feedback',
      twitterDescription: 'Contact MCQ Exam & Interview Preparer team. Get support, provide feedback, or ask questions about our AI-powered exam preparation platform.',
      twitterImage: 'https://www.ai-mcq-trainer.in/assets/og-image.jpg',
      canonicalUrl: 'https://www.ai-mcq-trainer.in/contact'
    };
  }
}