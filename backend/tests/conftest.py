import os
import pytest
from app import create_app
from app.extensions import db
from app.models.core import User, Company

@pytest.fixture
def app():
    app = create_app('test')

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def super_admin(app):
    company = Company(name="Admin Co", nif="000000000")
    db.session.add(company)
    db.session.commit()
    
    admin = User(
        email="admin@test.com", 
        supabase_auth_id="super_admin_id", 
        role="super_admin",
        company_id=company.id
    )
    db.session.add(admin)
    db.session.commit()
    return admin

@pytest.fixture
def normal_user(app):
    company = Company(name="User Co", nif="111111111")
    db.session.add(company)
    db.session.commit()
    
    user = User(
        email="user@test.com", 
        supabase_auth_id="normal_user_id", 
        role="user",
        company_id=company.id
    )
    db.session.add(user)
    db.session.commit()
    return user
