const {ObjectID} = require('mongodb');
const expect = require('expect');
const request = require('supertest');

const {app} = require ('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require ('./seed/seed');



beforeEach(populateUsers);
beforeEach(populateTodos);

describe('Post /todos', () => {
  it('should create a new todo', (done) => {
    var text = 'Test todo text';

    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1);
          expect(todos[0].text).toBe(text);
          done();
        }).catch((e) => done(e));
      });
  });
    
  it('should not create a new todo with invalid body data', (done) => {
      
      request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
          if (err) {
              return done(err);
          }
          
          Todo.find().then((todos) => {
              expect(todos.length).toBe(2);
              done();
          }).catch((e) => done(e));
      });
      
  });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
        
    });
});
    

describe('GET /todos/:id', () => {
    it('should get a todo by id', (done) => {
        request(app)
        .get('/todos/' + todos[0]._id.toHexString())
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });
    
    it('should not get todo of invalid id', (done) => {
        request(app)
        .get('/todos/notavalidid')
        .expect(404)
        .end(done);
    });
    
    it('should not get todo of an non-existent id', (done) => {
        request(app)
        .get('/todos/9adc9cd1184976052a91f999')
        .expect(404)
        .end(done);
    });
    
});

describe('DELETE /todos/:id', () => {
    
    it('should delete a todo', (done) => {

        
        var hexId = todos[1]._id.toHexString();    
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.findById(hexId).then((todo) => {
                expect(todo).toBe(null);
                done();
            }).catch((e) => done(e));
        });
    });
    
  
    it('should get 404 for todo of invalid id', (done) => {
        request(app)
        .delete('/todos/notavalidid')
        .expect(404)
        .end(done);
    });
    
    it('should get 404 for todo of an non-existent id', (done) => {
        
        var hexId = (new ObjectID()).toHexString();
        request(app)
        .delete(`/todos/${hexId}`)
        .expect(404)
        .end(done);
    });
    
    
    
});


describe('PATCH /todo/:id', () => {
    it('should update the todo', (done) => {
        var hexId = todos[0]._id.toHexString(); 
        var text = '****Updated Text****';
        
        request(app)
        .patch(`/todos/${hexId}`)
        .send({text, completed:true})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            //expect(res.body.todo.completedAt).toBeA('number');
        })
        .end(done);
    });
    
    it('should clear completedAt when todo is not completed', (done) => {
        var hexId = todos[1]._id.toHexString(); 
        var text = '****Updated Text****';
        
        request(app)
        .patch(`/todos/${hexId}`)
        .send({text, completed:false})
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBe(null);
        })
        .end(done);
    });
});


describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
        .get('/users/me')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.email).toBe(users[0].email);
            expect(res.body._id).toBe(users[0]._id.toHexString());
        })
        .end(done);
    });
    
    it('should return 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .end(done);
    });

    
});

describe('POST /users', () => {
   
    it('should create a user', (done) => {
        var email = 'new@example.com';
        var password = 'newUserPass';
        
        request(app)
        .post('/users')
        .send({email,password})
        .expect(200)
        .expect((res) => {
            expect(res.body.email).toBe(email);
            //expect(res.headers['x-auth']).toExist();
        })
        .end(done);
        
    });
    
    it('should return validation errors if request invalid', (done) => {
        var email = 'notemail';
        var password = '1';
        
        request(app)
        .post('/users')
        .send({email,password})
        .expect(400)
        .end(done);        
    });
    
    it('should return validation errors if email exists', (done) => {
        var email = users[0].email;
        var password = 'newUserPass';
        
        request(app)
        .post('/users')
        .send({email,password})
        .expect(400)
        .end(done);        
    });
    
    
});