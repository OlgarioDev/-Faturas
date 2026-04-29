import pytest
from app.models.core import User, SubscriptionStatus
from unittest.mock import patch

@patch('app.middleware.requests.get')
def test_admin_dashboard_access(mock_get, client, super_admin, normal_user):
    # Setup mock response for super admin
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"id": "super_admin_id"}

    response = client.get(
        '/api/admin/dashboard', 
        headers={"Authorization": "Bearer fake_token"}
    )
    assert response.status_code == 200
    assert "total_users" in response.json

    # Setup mock response for normal user
    mock_get.return_value.json.return_value = {"id": "normal_user_id"}

    response = client.get(
        '/api/admin/dashboard', 
        headers={"Authorization": "Bearer fake_token"}
    )
    assert response.status_code == 403

@patch('app.middleware.requests.get')
def test_suspend_and_activate_user(mock_get, app, client, super_admin, normal_user):
    # Setup mock response for super admin
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"id": "super_admin_id"}

    # Suspend user
    response = client.post(
        f'/api/admin/users/{normal_user.id}/suspend',
        headers={"Authorization": "Bearer fake_token"}
    )
    assert response.status_code == 200
    
    with app.app_context():
        user = User.query.get(normal_user.id)
        assert user.status == SubscriptionStatus.SUSPENDED_BY_ADMIN

    # Activate user
    response = client.post(
        f'/api/admin/users/{normal_user.id}/activate',
        headers={"Authorization": "Bearer fake_token"}
    )
    assert response.status_code == 200
    
    with app.app_context():
        user = User.query.get(normal_user.id)
        assert user.status == SubscriptionStatus.ACTIVE
