"use client"

import React, { useState } from 'react';
import { Upload, FileText, MessageCircle, Send, Loader2, AlertCircle } from 'lucide-react';

interface UploadedFile {
  name: string;
  size: number;
  id: string;
}

interface Answer {
  id: number;
  question: string;
  answer: string;
  timestamp: string;
}

export default function PDFQAInterface() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event:any) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload PDF');
      }

      const data = await response.json();
      setUploadedFile({
        name: file.name,
        size: file.size,
        id: data.fileId
      });
    } catch (err) {
      setError('Failed to upload PDF. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuestionSubmit = async () => {
    if (!question.trim() || !uploadedFile) return;

    setIsAsking(true);
    setError('');

    try {
      const response = await fetch('/api/ask-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: uploadedFile.id,
          question: question.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      
      setAnswers(prev => [...prev, {
        id: Date.now(),
        question: question.trim(),
        answer: data.answer,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      setQuestion('');
    } catch (err) {
      setError('Failed to get answer. Please try again.');
      console.error('Question error:', err);
    } finally {
      setIsAsking(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PDF Q&A Assistant</h1>
          <p className="text-gray-600">Upload a PDF and ask questions about its content</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
         
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload PDF
            </h2>
            
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  {isUploading ? (
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                  ) : (
                    <FileText className="w-12 h-12 text-gray-400" />
                  )}
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      {isUploading ? 'Uploading...' : 'Click to upload PDF'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Drag and drop or click to select
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800">{uploadedFile.name}</p>
                    <p className="text-sm text-green-600">{formatFileSize(uploadedFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove file
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Ask Questions
            </h2>
            
            <div className="space-y-4">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter your question about the PDF content..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={4}
                disabled={!uploadedFile || isAsking}
              />
              
              <button
                onClick={handleQuestionSubmit}
                disabled={!uploadedFile || !question.trim() || isAsking}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isAsking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Getting Answer...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Ask Question
                  </>
                )}
              </button>
            </div>
          </div>
        </div>


        {answers.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Questions & Answers
            </h2>
            
            <div className="space-y-4">
              {answers.map((qa) => (
                <div key={qa.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <div className="mb-2">
                    <p className="font-medium text-gray-800">Q: {qa.question}</p>
                    <p className="text-xs text-gray-500 mt-1">{qa.timestamp}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-700 leading-relaxed">
                      <span className="font-medium text-indigo-600">A: </span>
                      {qa.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setAnswers([])}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Clear all answers
            </button>
          </div>
        )}

        {!uploadedFile && (
          <div className="mt-8 bg-white/70 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="font-semibold text-gray-800 mb-3">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Upload a PDF file using the upload area above</li>
              <li>Wait for the file to be processed</li>
              <li>Enter your questions about the PDF content</li>
              <li>View the AI-generated answers below</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}