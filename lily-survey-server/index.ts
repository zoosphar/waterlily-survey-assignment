import {serve} from "bun";
import {Database} from 'bun:sqlite';
import type { Form, Option, Question, QuestionResponse } from "./types";

const db = new Database('form-db.sqlite', {create: true});

db.run(`
  CREATE TABLE IF NOT EXISTS options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    optionTitle TEXT NOT NULL,
    optionValue TEXT NOT NULL,
    questionId INTEGER NOT NULL,
    FOREIGN KEY (questionId) REFERENCES questions(id)
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    questionTitle TEXT NOT NULL,
    questionDescription TEXT NOT NULL,
    questionType TEXT NOT NULL,
    correctOptionId INTEGER,
    questionRequired BOOLEAN NOT NULL,
    questionAnswer TEXT,
    formId INTEGER NOT NULL,
    FOREIGN KEY (formId) REFERENCES forms(id)
  );

  CREATE TABLE IF NOT EXISTS forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formTitle TEXT NOT NULL,
    formDescription TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questionResponses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    formId INTEGER NOT NULL,
    questionId INTEGER NOT NULL,
    questionAnswer TEXT NOT NULL,
    FOREIGN KEY (formId) REFERENCES forms(id),
    FOREIGN KEY (questionId) REFERENCES questions(id)
  );
  `);


// Create a route for the for to get submitted and the route should accept 
// the form data and return the success response or errors if the form is not valid, 
// and store the form data in the db
serve({
  routes: {
    '/api/status': () => new Response('ok'),
    '/api/form/:id': (req) => {
      if(req.method !== 'GET') {
        return new Response(JSON.stringify({error: 'Method not allowed', allowedMethods: ['GET']}), {status: 405, headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }});
      }
      const formId = req.params.id;
      const form = db.query('SELECT * FROM forms WHERE id = ?').get(formId);
      const questions = db.query('SELECT * FROM questions WHERE formId = ?').all(formId) as Question[];
      questions.forEach((question: Question) => {
        question.questionOptions = db.query('SELECT * FROM options WHERE questionId = ?').all(question.id) as Option[];
      })
      return new Response(JSON.stringify({form, questions}), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    },
    '/api/form/submit': async (req) => {
      if(req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }
      if(req.method !== 'POST') {
        return new Response(JSON.stringify({error: 'Method not allowed', allowedMethods: ['POST']}), {status: 405, headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }});
      }
      const {questionResponses, formId }: {questionResponses:  QuestionResponse[], formId: string} = await req.json();
      if(questionResponses.length === 0) {
        return new Response(JSON.stringify({error: 'Questions are required'}), {status: 400, headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }});
      }
      questionResponses.forEach((questionResponse: QuestionResponse) => {
      db.query('INSERT INTO questionResponses (formId, questionId, questionAnswer) VALUES (?, ?, ?)')
        .run(formId, questionResponse.id, questionResponse.questionAnswer);
        
      });
      return new Response(JSON.stringify({status: 'success'}), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    },
    '/api/form/create': async (req) => {
      if(req.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        });
      }

      if(req.method !== 'POST') {
        return new Response(JSON.stringify({error: 'Method not allowed', allowedMethods: ['POST']}), {status: 405});
      }
      const {form, questions}: {form: Form, questions: Question[]} = await req.json();
      if(questions.length === 0) {
        return new Response(JSON.stringify({error: 'Questions are required'}), {status: 400});
      }
      if(form.formTitle === '' || form.formDescription === '') {
        return new Response(JSON.stringify({error: 'Form title and description are required'}), {status: 400});
      }
      const formResponse = db.query('INSERT INTO forms (formTitle, formDescription) VALUES (?, ?)').run(form.formTitle, form.formDescription);
      questions.forEach((question: Question) => {
        const questionResponse = db.query('INSERT INTO questions (questionTitle, questionDescription, questionType, correctOptionId, questionRequired, questionAnswer, formId) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(question.questionTitle, question.questionDescription, question.questionType, question.correctOptionId ?? null, question.questionRequired, question.questionAnswer ?? null, formResponse.lastInsertRowid);

        if(question.questionOptions && question.questionOptions.length > 0) {
          question.questionOptions.forEach((option: Option) => {
            db.query('INSERT INTO options (optionTitle, optionValue, questionId) VALUES (?, ?, ?)').run(option.optionTitle, option.optionValue, questionResponse.lastInsertRowid);
          })
        }
      })
      return new Response(JSON.stringify({status: 'success', formId: formResponse.lastInsertRowid}), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    },
    '/api/form/:id/review': (req) => {
      const formId = req.params.id;
      const form = db.query('SELECT * FROM forms WHERE id = ?').get(formId);
      const questions = db.query('SELECT * FROM questions WHERE formId = ?').all(formId) as Question[];
      questions.forEach((question: Question) => {
        question.questionOptions = db.query('SELECT * FROM options WHERE questionId = ?').all(question.id) as Option[];
        const questionAnswers = db.query('SELECT questionAnswer FROM questionResponses WHERE questionId = ?').all(question.id);
        question.questionAnswer = questionAnswers[questionAnswers.length - 1]?.questionAnswer;
      })
      return new Response(JSON.stringify({form, questions}), {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      });
    },
    '/*': (req) => {
     if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }
  return new Response('Not Found', { 
    status: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    }
  });
    }
      
  },
  port: 8080,
});
