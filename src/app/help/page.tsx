'use client'

import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search,
  Plus,
  List,
  Clock,
  Filter,
  Keyboard,
  Mail,
  HelpCircle,
  BookOpen,
  Settings,
  Tags,
  FileText
} from 'lucide-react'

interface ShortcutItem {
  keys: string[]
  description: string
  action?: () => void
}

interface FeatureItem {
  icon: React.ReactNode
  title: string
  description: string
  learnMoreUrl?: string
}

interface FaqItem {
  question: string
  answer: string
  relatedLinks?: Array<{ text: string; url: string }>
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null)

  const shortcuts: ShortcutItem[] = [
    { keys: ['Ctrl/Cmd', 'N'], description: 'Create new minion' },
    { keys: ['Ctrl/Cmd', 'F'], description: 'Focus search' },
    { keys: ['Ctrl/Cmd', '/'], description: 'Toggle help' },
    { keys: ['Ctrl/Cmd', 'B'], description: 'Toggle sidebar' },
    { keys: ['Ctrl/Cmd', 'S'], description: 'Save changes' },
    { keys: ['Ctrl/Cmd', 'K'], description: 'Open command palette' },
    { keys: ['Arrow Keys'], description: 'Pan the dependency canvas' },
    { keys: ['Shift', 'Arrow Keys'], description: 'Move focus between nodes on the dependency canvas' },
    { keys: ['+'], description: 'Zoom in on the dependency canvas' },
    { keys: ['-'], description: 'Zoom out on the dependency canvas' },
    { keys: ['R'], description: 'Reset view on the dependency canvas' }
  ]

  const features: FeatureItem[] = [
    {
      icon: <Plus className="h-4 w-4" />,
      title: "Quick Capture",
      description: "Quickly add new minions from anywhere in the app using the Quick Capture feature or keyboard shortcuts.",
      learnMoreUrl: "/docs/quick-capture"
    },
    {
      icon: <List className="h-4 w-4" />,
      title: "Multiple Views",
      description: "Switch between list, card, or icon view to see your minions in the way that works best for you.",
      learnMoreUrl: "/docs/views"
    },
    {
      icon: <Filter className="h-4 w-4" />,
      title: "Advanced Filtering",
      description: "Filter minions by status, priority, type, or any other attribute to find exactly what you need.",
      learnMoreUrl: "/docs/filtering"
    },
    {
      icon: <Clock className="h-4 w-4" />,
      title: "Time Tracking",
      description: "Track time spent on tasks to better understand your productivity patterns.",
      learnMoreUrl: "/docs/time-tracking"
    },
    {
      icon: <Tags className="h-4 w-4" />,
      title: "Tags & Labels",
      description: "Organize your minions with customizable tags and labels for better organization.",
      learnMoreUrl: "/docs/tags-labels"
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Rich Text Notes",
      description: "Add detailed notes to your minions with rich text formatting support.",
      learnMoreUrl: "/docs/rich-text"
    }
  ]

  const faqs: FaqItem[] = [
    {
      question: "How do I create a new minion?",
      answer: "You can create a new minion by clicking the '+' button in the top bar, using the Quick Capture feature, or pressing Ctrl/Cmd + N.",
      relatedLinks: [
        { text: "Quick Capture Guide", url: "/docs/quick-capture" },
        { text: "Keyboard Shortcuts", url: "/docs/shortcuts" }
      ]
    },
    {
      question: "How do I track time for a minion?",
      answer: "Open the minion details and click the timer button to start tracking time. Click again to stop the timer.",
      relatedLinks: [
        { text: "Time Tracking Guide", url: "/docs/time-tracking" }
      ]
    },
    {
      question: "Can I export my minions?",
      answer: "Yes, you can export your minions in various formats from the Settings menu.",
      relatedLinks: [
        { text: "Export Guide", url: "/docs/export" },
        { text: "Supported Formats", url: "/docs/export-formats" }
      ]
    }
  ]

  const filteredContent = useMemo(() => {
    if (!searchTerm) return { features, faqs }
    
    const searchLower = searchTerm.toLowerCase()
    
    return {
      features: features.filter(
        feature => 
          feature.title.toLowerCase().includes(searchLower) ||
          feature.description.toLowerCase().includes(searchLower)
      ),
      faqs: faqs.filter(
        faq => 
          faq.question.toLowerCase().includes(searchLower) ||
          faq.answer.toLowerCase().includes(searchLower)
      )
    }
  }, [searchTerm])

  const FeatureCard = ({ feature }: { feature: FeatureItem }) => (
    <div className="flex gap-3 p-4 rounded-lg border hover:border-primary transition-colors">
      <div className="mt-1 text-primary">{feature.icon}</div>
      <div>
        <h3 className="font-medium mb-1 flex items-center gap-2">
          {feature.title}
          {feature.learnMoreUrl && (
            <Button
              variant="link"
              className="text-xs h-auto p-0"
              onClick={() => window.location.href = feature.learnMoreUrl!}
            >
              Learn more
            </Button>
          )}
        </h3>
        <p className="text-sm text-muted-foreground">{feature.description}</p>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold">Help Center</h1>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full sm:w-[300px]"
          />
        </div>
      </div>

      <div className="grid gap-8">
        <section aria-labelledby="getting-started-title">
          <Card>
            <CardHeader>
              <CardTitle id="getting-started-title" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Learn the basics of using our Minion Management App
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredContent.features.map((feature, index) => (
                  <FeatureCard key={index} feature={feature} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="shortcuts-title">
          <Card>
            <CardHeader>
              <CardTitle id="shortcuts-title" className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </CardTitle>
              <CardDescription>
                Master these shortcuts to boost your productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {shortcuts.map((shortcut, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-accent"
                  >
                    <span className="text-muted-foreground">{shortcut.description}</span>
                    <div className="flex gap-1 flex-wrap">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-sm rounded bg-secondary"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="faq-title">
          <Card>
            <CardHeader>
              <CardTitle id="faq-title" className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion 
                type="single" 
                collapsible 
                value={activeAccordion ?? undefined}
                onValueChange={setActiveAccordion}
                className="w-full"
              >
                {filteredContent.faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4">{faq.answer}</p>
                      {faq.relatedLinks && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Related Resources:</p>
                          <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {faq.relatedLinks.map((link, linkIndex) => (
                              <li key={linkIndex}>
                                <Button
                                  variant="link"
                                  className="h-auto p-0"
                                  onClick={() => window.location.href = link.url}
                                >
                                  {link.text}
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="support-title">
          <Card>
            <CardHeader>
              <CardTitle id="support-title" className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Need More Help?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button>
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
                <Button variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  View Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
