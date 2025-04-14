"use client"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Home, ChevronDown, ChevronUp } from "lucide-react"
import "./Faq.css"

// FAQ Item component for each question/answer pair
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="faq-item">
      <button className={`faq-question ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        {isOpen ? <ChevronUp className="faq-icon" /> : <ChevronDown className="faq-icon" />}
      </button>

      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
    const navigate=useNavigate();
  // Ensure scrolling works when the component mounts
  useEffect(() => {
    // Reset scroll position when component mounts
    window.scrollTo(0, 0)

    // Make sure body is scrollable
    document.body.style.overflow = "auto"
    document.documentElement.style.overflow = "auto"

    return () => {
      // Clean up if needed
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [])

  // Example FAQ data
  const faqData = [
    {
      question: "How accurate is the disease detection?",
      answer:
        " The accuracy of our plant disease detection system depends on various factors such as the quality of the uploaded image, the specific plant species, and the conditions under which the image is taken. We use two machine learning models, Prototypical Networks and Matching Networks, to analyze and diagnose diseases. These models are trained on extensive datasets and provide reliable results, but we always recommend confirming the diagnosis with a professional or through additional resources, especially for rare or complex plant diseases.",
    },
    {
      question: "Why using two models?",
      answer:
        " We use two models—Prototypical Networks and Matching Networks—to maximize the accuracy of the disease detection. Both models have their strengths, and by comparing the results from each, we can select the one with the highest confidence. This approach helps ensure more reliable predictions, especially in cases where one model might be better suited for specific types of diseases or plants. Using two models also allows us to continuously improve our system by leveraging the advantages of each.",
    },
    {
      question: "What is few shot learning ?",
      answer:
        "Few-shot learning is a machine learning technique where a model is trained to learn patterns from only a small number of examples. Unlike traditional models that require large datasets to generalize well, few-shot learning is particularly useful when there is limited data available for certain categories, such as rare plant diseases. This approach allows our system to detect and classify diseases with fewer training examples, making it more adaptable and efficient in handling new or rare plant diseases.",
    },
    {
      question: "What is prototypical networks?",
      answer:
        "Prototypical Networks are a type of few-shot learning model that works by creating a prototype for each class or disease. In the context of plant disease detection, the prototype is a representation of what each disease looks like based on a small set of examples. When a new image is uploaded, the model compares it to these prototypes to determine the most likely disease. This method allows for quick and accurate classification, even with limited data."
    },
    {
      question: "What is matching networks?",
      answer:
        "Matching Networks are another type of few-shot learning model that excels at recognizing patterns from few examples. Unlike Prototypical Networks, which rely on creating prototypes for each class, Matching Networks use a similarity-based approach. They compare the input image to the closest examples in the training dataset to predict the most likely disease. This method is particularly effective when the system needs to make predictions based on very few labeled samples, offering flexibility and accuracy in disease detection.",
    },
    {
      question: "What should I do after diagnosing my plant?",
      answer:
        " After diagnosing your plant, you can check for more information in the Learn More section on our website. We recommend that you research the most effective treatment for your plant if the suggested solution doesn't work, or if you feel uncertain about the diagnosis. If the disease is detected in a large number of plants or spreads rapidly, we strongly advise consulting a plant specialist or professional for a more detailed assessment and targeted treatment."
    },
    
  ]

  const handleHome = () => {
    console.log("Navigate to home")
    // Add your navigation logic here
  }

  return (
    <div className="faq-container">
      {/* Navigation */}
      <div className="navigation">
      <button className="home-button" onClick={()=>navigate("/")}>
          <Home className="home-icon" />
        </button>
        <div className="profile-avatar">
          <div className="avatar-circle"></div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="faq-content">
        <h1 className="faq-heading">Frequently Asked Questions</h1>

        <div className="faq-card">
          {faqData.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="contact-info">
          <p>
            Still have questions?{" "}
            <a href="#" className="contact-link">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}