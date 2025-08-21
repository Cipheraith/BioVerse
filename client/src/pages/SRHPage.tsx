import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Users,
  Shield,
  Lightbulb,
  BookOpen,
  Baby,
  Pill,
  Stethoscope,
  MessageCircle,
  Activity,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

interface SRHSectionProps {
  title: string;
  icon: React.ReactNode;
  content: string[];
  delay: number;
  category?: string;
  resources?: { name: string; link?: string }[];
}

const SRHSection: React.FC<SRHSectionProps> = ({ title, icon, content, delay, resources, category }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
    >
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 dark:from-primary-400/20 dark:to-primary-500/20 p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <div className="text-primary-600 dark:text-primary-400 text-2xl">{icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">
              {title}
            </h3>
            {category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4 text-gray-600 dark:text-gray-300">
          {content.slice(0, expanded ? content.length : 2).map((paragraph, index) => (
            <p key={index} className="leading-relaxed text-sm">
              {paragraph}
            </p>
          ))}

          {content.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium text-sm mt-3"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} className="mr-1" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-1" /> Read more
                </>
              )}
            </button>
          )}

          {resources && expanded && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center text-sm">
                <ExternalLink size={16} className="mr-2" />
                Helpful Resources
              </h4>
              <div className="grid gap-2">
                {resources.map((resource, idx) => (
                  <div key={idx} className="flex items-center">
                    {resource.link ? (
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-colors text-sm flex items-center"
                      >
                        <ExternalLink size={12} className="mr-2 opacity-60" />
                        {resource.name}
                      </a>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                        <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mr-2" />
                        {resource.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

import ClinicLocator from './components/ClinicLocator';
import SRHSymptomChecker from './components/SRHSymptomChecker';
import ContraceptionExplorer from './components/ContraceptionExplorer';

const SRHPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'education', name: 'Education' },
    { id: 'health', name: 'Health' },
    { id: 'family', name: 'Family Planning' },
    { id: 'rights', name: 'Rights & Safety' },
    { id: 'wellness', name: 'Wellness' }
  ];

  const sections = [
    {
      title: "Adolescent Health (Ages 13-18)",
      icon: <Users />,
      category: 'education',
      content: [
        "As a teenager, you're experiencing more significant physical and emotional changes. The healthiest choice for adolescents is abstinence, which means choosing not to engage in sexual activity. This is the only way to fully prevent pregnancy and sexually transmitted infections (STIs), including HIV.",
        "Understanding consent is crucial: it means clearly agreeing to something without pressure. You have the right to say no to any touch or activity you don't want. If you choose to be sexually active, it is vital to understand how STIs and HIV are transmitted and how to protect yourself.",
        "Body image concerns are common during adolescence. Remember that media images are often edited and unrealistic. Focus on being healthy rather than looking a certain way.",
        "Peer pressure can be strong during these years. It's important to make decisions based on your own values and what's best for your health, not what others are doing.",
        "If you have questions about sexual health, or if you are sexually active, regular health check-ups are important. Remember, you can always talk to a healthcare provider confidentially about any concerns you have."
      ],
      resources: [
        { name: "Teen Health - Sexual Health", link: "https://teenshealth.org/en/teens/sexual-health/" },
        { name: "Love Is Respect - Healthy Relationships", link: "https://www.loveisrespect.org/" },
        { name: "Local youth clinics" },
        { name: "School counselors" },
        { name: "Health organizations that provide comprehensive SRH information" }
      ],
      delay: 0.4,
    },
    {
      title: "Adult Reproductive Health",
      icon: <Heart />,
      category: 'health',
      content: [
        "For adults, sexual and reproductive health encompasses family planning, maternal health, and preventing STIs. Choosing the right contraception method is a personal decision that should be discussed with a healthcare provider.",
        "Regular screenings, such as Pap tests for women and STI screenings for all sexually active individuals, are essential for early detection and prevention. Understanding your fertility and options for family planning is also key.",
        "Sexual health is an important part of overall well-being. Open communication with partners about desires, boundaries, and health status is essential for healthy sexual relationships.",
        "Reproductive health concerns can change throughout adulthood. Regular check-ups can help address issues like decreased fertility, hormonal changes, or sexual dysfunction.",
        "If you are planning a family, pre-conception care is important to ensure a healthy pregnancy. For men, understanding prostate health and fertility is also part of comprehensive reproductive health."
      ],
      resources: [
        { name: "Planned Parenthood", link: "https://www.plannedparenthood.org/" },
        { name: "American Sexual Health Association", link: "https://www.ashasexualhealth.org/" },
        { name: "World Health Organization - Sexual Health", link: "https://www.who.int/health-topics/sexual-health" },
        { name: "Family planning clinics" },
        { name: "Gynecologists and urologists" }
      ],
      delay: 0.6,
    },
    
    {
      title: "Maternal & Infant Health",
      icon: <Baby />,
      category: 'family',
      content: [
        "Maternal health encompasses the health of women during pregnancy, childbirth, and the postpartum period. Proper prenatal care is essential for monitoring the health of both mother and baby.",
        "Prenatal care includes regular check-ups, screenings, nutritional guidance, and education about pregnancy and childbirth. Early and consistent prenatal care can identify and address potential complications.",
        "During pregnancy, it's important to maintain a healthy lifestyle, including proper nutrition, appropriate exercise, avoiding harmful substances, and managing stress.",
        "Childbirth education classes can help prepare expectant parents for labor, delivery, and early parenthood. These classes cover topics like pain management techniques, breastfeeding, and newborn care.",
        "Postpartum care is crucial for the mother's physical and emotional recovery. This includes monitoring for complications, supporting breastfeeding, and screening for postpartum depression."
      ],
      resources: [
        { name: "March of Dimes", link: "https://www.marchofdimes.org/" },
        { name: "La Leche League (Breastfeeding Support)", link: "https://www.llli.org/" },
        { name: "Postpartum Support International", link: "https://www.postpartum.net/" },
        { name: "Obstetricians and midwives" },
        { name: "Prenatal classes and support groups" }
      ],
      delay: 1.0,
    },
    {
      title: "STI Prevention & Treatment",
      icon: <Shield />,
      category: 'health',
      content: [
        "Sexually transmitted infections (STIs) are infections passed from one person to another through sexual contact. Common STIs include chlamydia, gonorrhea, syphilis, herpes, HPV, and HIV.",
        "Prevention strategies include abstinence, using barriers like condoms and dental dams, limiting sexual partners, getting vaccinated (for HPV and hepatitis B), and regular STI testing.",
        "Many STIs can be asymptomatic, meaning they show no symptoms. Regular testing is the only way to know for sure if you have an STI, especially if you're sexually active with multiple partners.",
        "Most bacterial STIs (like chlamydia, gonorrhea, and syphilis) can be cured with antibiotics. Viral STIs (like herpes, HPV, and HIV) can be managed with medications but typically cannot be cured.",
        "If diagnosed with an STI, it's important to inform sexual partners so they can get tested and treated if necessary. This helps prevent reinfection and further transmission."
      ],
      resources: [
        { name: "CDC - Sexually Transmitted Diseases", link: "https://www.cdc.gov/std/default.htm" },
        { name: "Get Tested - Find Testing Locations", link: "https://gettested.cdc.gov/" },
        { name: "STI testing centers" },
        { name: "Healthcare providers specializing in sexual health" }
      ],
      delay: 1.2,
    },
    {
      title: "Reproductive Health Conditions",
      icon: <Stethoscope />,
      category: 'health',
      content: [
        "Various conditions can affect reproductive health. For women, these include polycystic ovary syndrome (PCOS), endometriosis, uterine fibroids, and pelvic inflammatory disease (PID).",
        "Men may experience conditions like erectile dysfunction, prostatitis, testicular cancer, and low testosterone. These conditions can affect sexual function and fertility.",
        "Symptoms of reproductive health conditions can include irregular periods, pelvic pain, painful intercourse, difficulty conceiving, and changes in sexual function. If you experience these symptoms, consult a healthcare provider.",
        "Diagnosis often involves physical examinations, blood tests, imaging studies, and sometimes minimally invasive procedures like laparoscopy. Early diagnosis can lead to more effective treatment.",
        "Treatment options vary depending on the condition and may include medications, hormone therapy, lifestyle changes, or surgical interventions. Working with specialists in reproductive health can help manage these conditions effectively."
      ],
      resources: [
        { name: "PCOS Awareness Association", link: "https://www.pcosaa.org/" },
        { name: "Endometriosis Foundation of America", link: "https://www.endofound.org/" },
        { name: "Men's Health Network", link: "https://www.menshealthnetwork.org/" },
        { name: "Reproductive endocrinologists" },
        { name: "Urologists and gynecologists" }
      ],
      delay: 1.4,
    },
    {
      title: "Sexual Rights & Safety",
      icon: <Shield />,
      category: 'rights',
      content: [
        "Everyone has the right to make decisions about their own body and sexual health. This includes the right to consent, the right to refuse, and the right to access accurate information and services.",
        "Consent must be freely given, reversible, informed, enthusiastic, and specific. It can be withdrawn at any time, and consent for one activity does not mean consent for others.",
        "Sexual coercion, harassment, and violence are violations of sexual rights. These include unwanted sexual advances, pressure to engage in sexual activities, and any sexual contact without consent.",
        "Digital sexual safety is increasingly important. This includes being cautious about sharing intimate images, understanding the risks of online dating, and recognizing online sexual harassment.",
        "If you ever feel unsafe, pressured, or experience any form of sexual harassment or violence, it is important to seek help immediately. There are organizations and helplines available to support you."
      ],
      resources: [
        { name: "RAINN (Rape, Abuse & Incest National Network)", link: "https://www.rainn.org/" },
        { name: "National Sexual Violence Resource Center", link: "https://www.nsvrc.org/" },
        { name: "Love Is Respect", link: "https://www.loveisrespect.org/" },
        { name: "National helplines for sexual assault" },
        { name: "Legal aid services" }
      ],
      delay: 1.6,
    },
    {
      title: "Mental Health & Sexuality",
      icon: <MessageCircle />,
      category: 'wellness',
      content: [
        "Sexual and reproductive health is deeply connected to mental well-being. Stress, anxiety, and depression can impact sexual function, desire, and reproductive choices.",
        "Body image concerns can affect sexual confidence and satisfaction. Developing a positive relationship with your body is important for sexual well-being.",
        "Sexual trauma can have lasting psychological effects. Therapy with trauma-informed professionals can help in healing and reclaiming sexual health.",
        "Relationship dynamics significantly impact sexual health. Healthy communication, trust, and mutual respect contribute to satisfying sexual relationships.",
        "Conversely, positive sexual health experiences can contribute to improved self-esteem and overall mental health. It's important to address any mental health concerns alongside SRH."
      ],
      resources: [
        { name: "American Association of Sexuality Educators, Counselors and Therapists", link: "https://www.aasect.org/" },
        { name: "Psychology Today - Find a Sex Therapist", link: "https://www.psychologytoday.com/us/therapists/sex-therapy" },
        { name: "Mental health professionals specializing in sexual health" },
        { name: "Support groups" },
        { name: "Mindfulness and stress management resources" }
      ],
      delay: 1.8,
    },
    {
      title: "Nutrition & Reproductive Health",
      icon: <Activity />,
      category: 'wellness',
      content: [
        "A balanced diet plays a crucial role in maintaining good sexual and reproductive health. Nutrients like folic acid, iron, zinc, and omega-3 fatty acids are vital for reproductive function and fetal development.",
        "For women planning pregnancy, adequate folic acid intake before conception and during early pregnancy can help prevent neural tube defects in the developing baby.",
        "Certain foods and nutrients can help manage hormonal conditions like PCOS. These include anti-inflammatory foods, fiber-rich foods, and foods with a low glycemic index.",
        "For men, nutrients like zinc, selenium, and antioxidants support sperm health and production. A diet rich in fruits, vegetables, whole grains, and lean proteins can support male fertility.",
        "Maintaining a healthy weight through proper nutrition can help prevent or manage conditions that affect reproductive health, such as PCOS, infertility, and erectile dysfunction."
      ],
      resources: [
        { name: "Academy of Nutrition and Dietetics", link: "https://www.eatright.org/" },
        { name: "American Pregnancy Association - Nutrition", link: "https://americanpregnancy.org/healthy-pregnancy/pregnancy-health-wellness/pregnancy-nutrition/" },
        { name: "Registered dietitians specializing in reproductive health" },
        { name: "Nutrition guides from health organizations" }
      ],
      delay: 2.2,
    },
    {
      title: "Exercise & Sexual Health",
      icon: <Activity />,
      category: 'wellness',
      content: [
        "Regular physical activity can positively impact sexual and reproductive health by improving circulation, reducing stress, and maintaining a healthy weight.",
        "Exercise increases blood flow throughout the body, including to the genital area, which can enhance sexual arousal and function for both men and women.",
        "Specific exercises like Kegel exercises strengthen the pelvic floor muscles, which can improve sexual function and help prevent or manage conditions like urinary incontinence.",
        "Moderate exercise during pregnancy, when approved by a healthcare provider, can help manage weight gain, reduce discomfort, and prepare the body for labor and delivery.",
        "Exercise can also boost mood and energy levels, which can enhance sexual desire and satisfaction. Aim for at least 150 minutes of moderate exercise per week for overall health benefits."
      ],
      resources: [
        { name: "American College of Sports Medicine", link: "https://www.acsm.org/" },
        { name: "Pelvic floor physical therapists" },
        { name: "Prenatal exercise classes" },
        { name: "Fitness trainers knowledgeable about reproductive health" }
      ],
      delay: 2.4,
    },
    {
      title: "Substance Use & Reproductive Health",
      icon: <AlertTriangle />,
      category: 'wellness',
      content: [
        "Substance use, including alcohol, tobacco, and drugs, can have detrimental effects on sexual and reproductive health. It can impair judgment, leading to risky sexual behaviors and increased exposure to STIs and unintended pregnancies.",
        "Alcohol consumption can affect sexual function, causing erectile dysfunction in men and decreased lubrication and orgasmic function in women. Long-term heavy drinking can also lead to fertility problems.",
        "Smoking tobacco can damage reproductive health by affecting hormone levels, sperm quality, and egg viability. It also increases the risk of complications during pregnancy and can lead to early menopause in women.",
        "Drug use during pregnancy can cause serious harm to the developing fetus, including birth defects, premature birth, low birth weight, and neonatal abstinence syndrome.",
        "Seeking help for substance use is crucial for overall health, including reproductive health. Treatment options include counseling, support groups, medication-assisted treatment, and rehabilitation programs."
      ],
      resources: [
        { name: "Substance Abuse and Mental Health Services Administration (SAMHSA)", link: "https://www.samhsa.gov/" },
        { name: "National Institute on Drug Abuse", link: "https://www.drugabuse.gov/" },
        { name: "Addiction counseling services" },
        { name: "Support groups like AA or NA" },
        { name: "National helplines for substance abuse" }
      ],
      delay: 2.6,
    },
    {
      title: "Global SRH Resources & Education",
      icon: <BookOpen />,
      category: 'education',
      content: [
        "Sexual and reproductive health education varies widely around the world. International organizations work to promote comprehensive SRH education and services globally.",
        "Access to SRH services is recognized as a human right, yet many people worldwide face barriers to accessing these services due to legal restrictions, cultural norms, or lack of resources.",
        "Digital resources have expanded access to SRH information, allowing people to learn about sexual health even in areas where formal education may be limited or restricted.",
        "Community-based programs play an important role in providing culturally appropriate SRH education and services, particularly in underserved areas.",
        "Advocacy efforts continue to work toward ensuring universal access to comprehensive SRH education and services, recognizing that this is essential for achieving gender equality and sustainable development."
      ],
      resources: [
        { name: "World Health Organization - Sexual and Reproductive Health", link: "https://www.who.int/health-topics/sexual-and-reproductive-health" },
        { name: "United Nations Population Fund", link: "https://www.unfpa.org/" },
        { name: "International Planned Parenthood Federation", link: "https://www.ippf.org/" },
        { name: "Guttmacher Institute", link: "https://www.guttmacher.org/" },
        { name: "Global SRH educational resources and organizations" }
      ],
      delay: 2.8,
    },
    {
      title: "Reproductive Technology & Fertility",
      icon: <Pill />,
      category: 'family',
      content: [
        "Assisted reproductive technologies (ART) offer options for individuals and couples experiencing infertility. These include in vitro fertilization (IVF), intrauterine insemination (IUI), and intracytoplasmic sperm injection (ICSI).",
        "Fertility preservation methods, such as egg freezing, sperm banking, and embryo freezing, allow individuals to preserve reproductive potential before medical treatments that might affect fertility or to delay childbearing.",
        "Genetic testing technologies like preimplantation genetic testing (PGT) can screen embryos for genetic disorders before implantation during IVF, helping prevent the transmission of certain genetic conditions.",
        "Third-party reproduction options include using donor eggs, sperm, or embryos, as well as gestational surrogacy. These options have specific legal, ethical, and emotional considerations that vary by location.",
        "Accessing fertility treatments often involves medical, financial, and emotional challenges. Support groups and counseling can help individuals and couples navigate the fertility journey."
      ],
      resources: [
        { name: "RESOLVE: The National Infertility Association", link: "https://resolve.org/" },
        { name: "American Society for Reproductive Medicine", link: "https://www.asrm.org/" },
        { name: "Fertility clinics" },
        { name: "Reproductive endocrinologists" },
        { name: "Fertility support groups" }
      ],
      delay: 3.0,
    }
  ];

  // Filter sections based on search term and active category
  const filteredSections = sections.filter(section => {
    const matchesSearch = searchTerm === '' ||
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.some(paragraph => paragraph.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = activeCategory === 'all' || section.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 text-text dark:text-dark-text">
            Sexual and Reproductive Health
          </h1>
          <p className="text-base sm:text-lg text-muted dark:text-dark-muted max-w-3xl mx-auto px-4">
            Your trusted resource for sexual and reproductive health information and services.
          </p>
        </div>

        {/* Search and Filter Section - Moved to top */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-muted dark:text-dark-muted" />
              </div>
              <input
                type="text"
                placeholder="Search sexual and reproductive health topics, symptoms, conditions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-base rounded-xl bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              />
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <span className="text-lg">×</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105
                    ${activeCategory === category.id
                      ? 'bg-primary-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search Results Summary */}
          {(searchTerm || activeCategory !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredSections.length > 0 ? (
                  <>
                    Showing <span className="font-semibold text-primary-600">{filteredSections.length}</span> result{filteredSections.length !== 1 ? 's' : ''}
                    {searchTerm && <> for "<span className="font-medium">{searchTerm}</span>"</>}
                    {activeCategory !== 'all' && <> in <span className="font-medium">{categories.find(c => c.id === activeCategory)?.name}</span></>}
                  </>
                ) : (
                  <>
                    No results found
                    {searchTerm && <> for "<span className="font-medium">{searchTerm}</span>"</>}
                    {activeCategory !== 'all' && <> in <span className="font-medium">{categories.find(c => c.id === activeCategory)?.name}</span></>}
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        <div className="mb-6 sm:mb-8">
          <SRHSymptomChecker />
        </div>

        {/* Standalone sections */}
        
        {/* Contraceptive Explorer Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <ContraceptionExplorer />
        </div>
        
        {/* Know Your Body Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Understanding Your Body (Ages 9-12)"
            icon={<Lightbulb />}
            content={[
              "At this age, your body is starting to change. You might notice new hair growing, or your body shape changing. These are normal signs of puberty, which is when your body starts to become an adult body.",
              "Girls might start their periods, which is when they bleed from their vagina once a month. Boys' voices might get deeper, and they might start to grow facial hair. It's important to keep your body clean and healthy during these changes.",
              "During puberty, you might experience mood swings and new feelings. This is normal as your hormones change. Taking care of your emotional health is just as important as physical health.",
              "If you have questions, talk to a trusted adult like a parent, guardian, or teacher. They can help you understand what's happening."
            ]}
            resources={[
              { name: "Kids Health - Puberty", link: "https://kidshealth.org/en/kids/puberty.html" },
              { name: "Amaze.org - Puberty Videos", link: "https://amaze.org/" },
              { name: "Books on puberty for pre-teens" },
              { name: "School health classes" }
            ]}
            delay={0.2}
          />
        </div>
        
        {/* Adolescent Health Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Adolescent Health (Ages 13-18)"
            icon={<Users />}
            content={[
              "As a teenager, you're experiencing more significant physical and emotional changes. The healthiest choice for adolescents is abstinence, which means choosing not to engage in sexual activity. This is the only way to fully prevent pregnancy and sexually transmitted infections (STIs), including HIV.",
              "Understanding consent is crucial: it means clearly agreeing to something without pressure. You have the right to say no to any touch or activity you don't want. If you choose to be sexually active, it is vital to understand how STIs and HIV are transmitted and how to protect yourself.",
              "Body image concerns are common during adolescence. Remember that media images are often edited and unrealistic. Focus on being healthy rather than looking a certain way.",
              "Peer pressure can be strong during these years. It's important to make decisions based on your own values and what's best for your health, not what others are doing.",
              "If you have questions about sexual health, or if you are sexually active, regular health check-ups are important. Remember, you can always talk to a healthcare provider confidentially about any concerns you have."
            ]}
            resources={[
              { name: "Teen Health - Sexual Health", link: "https://teenshealth.org/en/teens/sexual-health/" },
              { name: "Love Is Respect - Healthy Relationships", link: "https://www.loveisrespect.org/" },
              { name: "Local youth clinics" },
              { name: "School counselors" },
              { name: "Health organizations that provide comprehensive SRH information" }
            ]}
            delay={0.4}
          />
        </div>
        
        {/* Adult Reproductive Health Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Adult Reproductive Health"
            icon={<Heart />}
            content={[
              "For adults, sexual and reproductive health encompasses family planning, maternal health, and preventing STIs. Choosing the right contraception method is a personal decision that should be discussed with a healthcare provider.",
              "Regular screenings, such as Pap tests for women and STI screenings for all sexually active individuals, are essential for early detection and prevention. Understanding your fertility and options for family planning is also key.",
              "Sexual health is an important part of overall well-being. Open communication with partners about desires, boundaries, and health status is essential for healthy sexual relationships.",
              "Reproductive health concerns can change throughout adulthood. Regular check-ups can help address issues like decreased fertility, hormonal changes, or sexual dysfunction.",
              "If you are planning a family, pre-conception care is important to ensure a healthy pregnancy. For men, understanding prostate health and fertility is also part of comprehensive reproductive health."
            ]}
            resources={[
              { name: "Planned Parenthood", link: "https://www.plannedparenthood.org/" },
              { name: "American Sexual Health Association", link: "https://www.ashasexualhealth.org/" },
              { name: "World Health Organization - Sexual Health", link: "https://www.who.int/health-topics/sexual-health" },
              { name: "Family planning clinics" },
              { name: "Gynecologists and urologists" }
            ]}
            delay={0.6}
          />
        </div>
        
        {/* Maternal & Infant Health Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Maternal & Infant Health"
            icon={<Baby />}
            content={[
              "Maternal health encompasses the health of women during pregnancy, childbirth, and the postpartum period. Proper prenatal care is essential for monitoring the health of both mother and baby.",
              "Prenatal care includes regular check-ups, screenings, nutritional guidance, and education about pregnancy and childbirth. Early and consistent prenatal care can identify and address potential complications.",
              "During pregnancy, it's important to maintain a healthy lifestyle, including proper nutrition, appropriate exercise, avoiding harmful substances, and managing stress.",
              "Childbirth education classes can help prepare expectant parents for labor, delivery, and early parenthood. These classes cover topics like pain management techniques, breastfeeding, and newborn care.",
              "Postpartum care is crucial for the mother's physical and emotional recovery. This includes monitoring for complications, supporting breastfeeding, and screening for postpartum depression."
            ]}
            resources={[
              { name: "March of Dimes", link: "https://www.marchofdimes.org/" },
              { name: "La Leche League (Breastfeeding Support)", link: "https://www.llli.org/" },
              { name: "Postpartum Support International", link: "https://www.postpartum.net/" },
              { name: "Obstetricians and midwives" },
              { name: "Prenatal classes and support groups" }
            ]}
            delay={1.0}
          />
        </div>
        
        {/* STI Prevention & Treatment Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="STI Prevention & Treatment"
            icon={<Shield />}
            content={[
              "Sexually transmitted infections (STIs) are infections passed from one person to another through sexual contact. Common STIs include chlamydia, gonorrhea, syphilis, herpes, HPV, and HIV.",
              "Prevention strategies include abstinence, using barriers like condoms and dental dams, limiting sexual partners, getting vaccinated (for HPV and hepatitis B), and regular STI testing.",
              "Many STIs can be asymptomatic, meaning they show no symptoms. Regular testing is the only way to know for sure if you have an STI, especially if you're sexually active with multiple partners.",
              "Most bacterial STIs (like chlamydia, gonorrhea, and syphilis) can be cured with antibiotics. Viral STIs (like herpes, HPV, and HIV) can be managed with medications but typically cannot be cured.",
              "If diagnosed with an STI, it's important to inform sexual partners so they can get tested and treated if necessary. This helps prevent reinfection and further transmission."
            ]}
            resources={[
              { name: "CDC - Sexually Transmitted Diseases", link: "https://www.cdc.gov/std/default.htm" },
              { name: "Get Tested - Find Testing Locations", link: "https://gettested.cdc.gov/" },
              { name: "STI testing centers" },
              { name: "Healthcare providers specializing in sexual health" }
            ]}
            delay={1.2}
          />
        </div>
        
        {/* Reproductive Health Conditions Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Reproductive Health Conditions"
            icon={<Stethoscope />}
            content={[
              "Various conditions can affect reproductive health. For women, these include polycystic ovary syndrome (PCOS), endometriosis, uterine fibroids, and pelvic inflammatory disease (PID).",
              "Men may experience conditions like erectile dysfunction, prostatitis, testicular cancer, and low testosterone. These conditions can affect sexual function and fertility.",
              "Symptoms of reproductive health conditions can include irregular periods, pelvic pain, painful intercourse, difficulty conceiving, and changes in sexual function. If you experience these symptoms, consult a healthcare provider.",
              "Diagnosis often involves physical examinations, blood tests, imaging studies, and sometimes minimally invasive procedures like laparoscopy. Early diagnosis can lead to more effective treatment.",
              "Treatment options vary depending on the condition and may include medications, hormone therapy, lifestyle changes, or surgical interventions. Working with specialists in reproductive health can help manage these conditions effectively."
            ]}
            resources={[
              { name: "PCOS Awareness Association", link: "https://www.pcosaa.org/" },
              { name: "Endometriosis Foundation of America", link: "https://www.endofound.org/" },
              { name: "Men's Health Network", link: "https://www.menshealthnetwork.org/" },
              { name: "Reproductive endocrinologists" },
              { name: "Urologists and gynecologists" }
            ]}
            delay={1.4}
          />
        </div>
        
        {/* Sexual Rights & Safety Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Sexual Rights & Safety"
            icon={<Shield />}
            content={[
              "Everyone has the right to make decisions about their own body and sexual health. This includes the right to consent, the right to refuse, and the right to access accurate information and services.",
              "Consent must be freely given, reversible, informed, enthusiastic, and specific. It can be withdrawn at any time, and consent for one activity does not mean consent for others.",
              "Sexual coercion, harassment, and violence are violations of sexual rights. These include unwanted sexual advances, pressure to engage in sexual activities, and any sexual contact without consent.",
              "Digital sexual safety is increasingly important. This includes being cautious about sharing intimate images, understanding the risks of online dating, and recognizing online sexual harassment.",
              "If you ever feel unsafe, pressured, or experience any form of sexual harassment or violence, it is important to seek help immediately. There are organizations and helplines available to support you."
            ]}
            resources={[
              { name: "RAINN (Rape, Abuse & Incest National Network)", link: "https://www.rainn.org/" },
              { name: "National Sexual Violence Resource Center", link: "https://www.nsvrc.org/" },
              { name: "Love Is Respect", link: "https://www.loveisrespect.org/" },
              { name: "National helplines for sexual assault" },
              { name: "Legal aid services" }
            ]}
            delay={1.6}
          />
        </div>
        
        {/* Mental Health & Sexuality Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Mental Health & Sexuality"
            icon={<MessageCircle />}
            content={[
              "Sexual and reproductive health is deeply connected to mental well-being. Stress, anxiety, and depression can impact sexual function, desire, and reproductive choices.",
              "Body image concerns can affect sexual confidence and satisfaction. Developing a positive relationship with your body is important for sexual well-being.",
              "Sexual trauma can have lasting psychological effects. Therapy with trauma-informed professionals can help in healing and reclaiming sexual health.",
              "Relationship dynamics significantly impact sexual health. Healthy communication, trust, and mutual respect contribute to satisfying sexual relationships.",
              "Conversely, positive sexual health experiences can contribute to improved self-esteem and overall mental health. It's important to address any mental health concerns alongside SRH."
            ]}
            resources={[
              { name: "American Association of Sexuality Educators, Counselors and Therapists", link: "https://www.aasect.org/" },
              { name: "Psychology Today - Find a Sex Therapist", link: "https://www.psychologytoday.com/us/therapists/sex-therapy" },
              { name: "Mental health professionals specializing in sexual health" },
              { name: "Support groups" },
              { name: "Mindfulness and stress management resources" }
            ]}
            delay={1.8}
          />
        </div>
        
        {/* Nutrition & Reproductive Health Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Nutrition & Reproductive Health"
            icon={<Activity />}
            content={[
              "A balanced diet plays a crucial role in maintaining good sexual and reproductive health. Nutrients like folic acid, iron, zinc, and omega-3 fatty acids are vital for reproductive function and fetal development.",
              "For women planning pregnancy, adequate folic acid intake before conception and during early pregnancy can help prevent neural tube defects in the developing baby.",
              "Certain foods and nutrients can help manage hormonal conditions like PCOS. These include anti-inflammatory foods, fiber-rich foods, and foods with a low glycemic index.",
              "For men, nutrients like zinc, selenium, and antioxidants support sperm health and production. A diet rich in fruits, vegetables, whole grains, and lean proteins can support male fertility.",
              "Maintaining a healthy weight through proper nutrition can help prevent or manage conditions that affect reproductive health, such as PCOS, infertility, and erectile dysfunction."
            ]}
            resources={[
              { name: "Academy of Nutrition and Dietetics", link: "https://www.eatright.org/" },
              { name: "American Pregnancy Association - Nutrition", link: "https://americanpregnancy.org/healthy-pregnancy/pregnancy-health-wellness/pregnancy-nutrition/" },
              { name: "Registered dietitians specializing in reproductive health" },
              { name: "Nutrition guides from health organizations" }
            ]}
            delay={2.2}
          />
        </div>
        
        {/* Exercise & Sexual Health Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Exercise & Sexual Health"
            icon={<Activity />}
            content={[
              "Regular physical activity can positively impact sexual and reproductive health by improving circulation, reducing stress, and maintaining a healthy weight.",
              "Exercise increases blood flow throughout the body, including to the genital area, which can enhance sexual arousal and function for both men and women.",
              "Specific exercises like Kegel exercises strengthen the pelvic floor muscles, which can improve sexual function and help prevent or manage conditions like urinary incontinence.",
              "Moderate exercise during pregnancy, when approved by a healthcare provider, can help manage weight gain, reduce discomfort, and prepare the body for labor and delivery.",
              "Exercise can also boost mood and energy levels, which can enhance sexual desire and satisfaction. Aim for at least 150 minutes of moderate exercise per week for overall health benefits."
            ]}
            resources={[
              { name: "American College of Sports Medicine", link: "https://www.acsm.org/" },
              { name: "Pelvic floor physical therapists" },
              { name: "Prenatal exercise classes" },
              { name: "Fitness trainers knowledgeable about reproductive health" }
            ]}
            delay={2.4}
          />
        </div>
        
        {/* Substance Use & Reproductive Health Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Substance Use & Reproductive Health"
            icon={<AlertTriangle />}
            content={[
              "Substance use, including alcohol, tobacco, and drugs, can have detrimental effects on sexual and reproductive health. It can impair judgment, leading to risky sexual behaviors and increased exposure to STIs and unintended pregnancies.",
              "Alcohol consumption can affect sexual function, causing erectile dysfunction in men and decreased lubrication and orgasmic function in women. Long-term heavy drinking can also lead to fertility problems.",
              "Smoking tobacco can damage reproductive health by affecting hormone levels, sperm quality, and egg viability. It also increases the risk of complications during pregnancy and can lead to early menopause in women.",
              "Drug use during pregnancy can cause serious harm to the developing fetus, including birth defects, premature birth, low birth weight, and neonatal abstinence syndrome.",
              "Seeking help for substance use is crucial for overall health, including reproductive health. Treatment options include counseling, support groups, medication-assisted treatment, and rehabilitation programs."
            ]}
            resources={[
              { name: "Substance Abuse and Mental Health Services Administration (SAMHSA)", link: "https://www.samhsa.gov/" },
              { name: "National Institute on Drug Abuse", link: "https://www.drugabuse.gov/" },
              { name: "Addiction counseling services" },
              { name: "Support groups like AA or NA" },
              { name: "National helplines for substance abuse" }
            ]}
            delay={2.6}
          />
        </div>
        
        {/* Global SRH Resources & Education Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Global SRH Resources & Education"
            icon={<BookOpen />}
            content={[
              "Sexual and reproductive health education varies widely around the world. International organizations work to promote comprehensive SRH education and services globally.",
              "Access to SRH services is recognized as a human right, yet many people worldwide face barriers to accessing these services due to legal restrictions, cultural norms, or lack of resources.",
              "Digital resources have expanded access to SRH information, allowing people to learn about sexual health even in areas where formal education may be limited or restricted.",
              "Community-based programs play an important role in providing culturally appropriate SRH education and services, particularly in underserved areas.",
              "Advocacy efforts continue to work toward ensuring universal access to comprehensive SRH education and services, recognizing that this is essential for achieving gender equality and sustainable development."
            ]}
            resources={[
              { name: "World Health Organization - Sexual and Reproductive Health", link: "https://www.who.int/health-topics/sexual-and-reproductive-health" },
              { name: "United Nations Population Fund", link: "https://www.unfpa.org/" },
              { name: "International Planned Parenthood Federation", link: "https://www.ippf.org/" },
              { name: "Guttmacher Institute", link: "https://www.guttmacher.org/" },
              { name: "Global SRH educational resources and organizations" }
            ]}
            delay={2.8}
          />
        </div>
        
        {/* Reproductive Technology & Fertility Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <SRHSection
            title="Reproductive Technology & Fertility"
            icon={<Pill />}
            content={[
              "Assisted reproductive technologies (ART) offer options for individuals and couples experiencing infertility. These include in vitro fertilization (IVF), intrauterine insemination (IUI), and intracytoplasmic sperm injection (ICSI).",
              "Fertility preservation methods, such as egg freezing, sperm banking, and embryo freezing, allow individuals to preserve reproductive potential before medical treatments that might affect fertility or to delay childbearing.",
              "Genetic testing technologies like preimplantation genetic testing (PGT) can screen embryos for genetic disorders before implantation during IVF, helping prevent the transmission of certain genetic conditions.",
              "Third-party reproduction options include using donor eggs, sperm, or embryos, as well as gestational surrogacy. These options have specific legal, ethical, and emotional considerations that vary by location.",
              "Accessing fertility treatments often involves medical, financial, and emotional challenges. Support groups and counseling can help individuals and couples navigate the fertility journey."
            ]}
            resources={[
              { name: "RESOLVE: The National Infertility Association", link: "https://resolve.org/" },
              { name: "American Society for Reproductive Medicine", link: "https://www.asrm.org/" },
              { name: "Fertility clinics" },
              { name: "Reproductive endocrinologists" },
              { name: "Fertility support groups" }
            ]}
            delay={3.0}
          />
        </div>

        {/* Find a Clinic Section */}
        <div className="mt-12 sm:mt-16 mb-8 sm:mb-12">
          <ClinicLocator />
        </div>

        {/* Additional Resources Section */}
        <div className="mt-12 sm:mt-16 bg-card dark:bg-dark-card p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-text dark:text-dark-text">Additional Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-5 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-text dark:text-dark-text">Zambian Health Hotlines & Support</h3>
              <ul className="space-y-2 text-sm sm:text-base text-muted dark:text-dark-muted">
                <li className="leading-relaxed">Ministry of Health Hotline: <span className="font-medium">+260-211-253-344</span></li>
                <li className="leading-relaxed">Zambia Sexual Health Helpline: <span className="font-medium">+260-977-000-111</span></li>
                <li className="leading-relaxed">University Teaching Hospital: <span className="font-medium">+260-211-254-131</span></li>
                <li className="leading-relaxed">Emergency Services: <span className="font-medium">999</span></li>
                <li className="leading-relaxed">YWCA Zambia (Gender Based Violence): <span className="font-medium">+260-211-229-717</span></li>
              </ul>
            </div>
            <div className="p-4 sm:p-5 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-text dark:text-dark-text">Educational Websites</h3>
              <ul className="space-y-2 text-sm sm:text-base text-muted dark:text-dark-muted">
                <li><a href="https://www.scarleteen.com/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline hover:text-primary-500 transition-colors">Scarleteen</a></li>
                <li><a href="https://www.cdc.gov/sexualhealth/" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline hover:text-primary-500 transition-colors">CDC Sexual Health</a></li>
                <li><a href="https://www.plannedparenthood.org/learn" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline hover:text-primary-500 transition-colors">Planned Parenthood Learning Center</a></li>
                <li><a href="https://www.who.int/health-topics/sexual-health" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline hover:text-primary-500 transition-colors">WHO Sexual Health Resources</a></li>
              </ul>
            </div>
            <div className="p-4 sm:p-5 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-text dark:text-dark-text">Mobile Apps</h3>
              <ul className="space-y-2 text-sm sm:text-base text-muted dark:text-dark-muted">
                <li>Clue (Period & Ovulation Tracker)</li>
                <li>Spot On (Birth Control Reminder)</li>
                <li>Real Talk (Sexual Health Education)</li>
                <li>Eve (Period Tracker & Sexual Health)</li>
                <li>Nurx (Birth Control & STI Testing)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SRHPage;
