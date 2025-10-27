import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import { User, Mail, Coins, Calendar, Edit2, Save } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    avatar: user?.avatar || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateProfile(formData));
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-slate-400">Manage your account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 p-6">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-32 h-32 rounded-full border-4 border-purple-500"
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-slate-800"></div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
              <p className="text-slate-400 text-sm mb-4">{user.email}</p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full">
                <span className="text-xs font-semibold text-purple-400 uppercase">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400 text-sm">Coins</span>
                <div className="flex items-center space-x-2 text-yellow-400 font-bold">
                  <Coins className="w-5 h-5" />
                  <span>{user.coins}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400 text-sm">Games Created</span>
                <span className="text-white font-bold">{user.createdGames?.length || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400 text-sm">Assets Owned</span>
                <span className="text-white font-bold">{user.inventory?.length || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400 text-sm">Member Since</span>
                <span className="text-white text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Edit Profile Form */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Account Settings</h3>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      !isEditing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://example.com/avatar.jpg"
                    className={`w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      !isEditing ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={user.role.toUpperCase()}
                    disabled
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 opacity-50 cursor-not-allowed"
                  />
                </div>

                {/* Buttons */}
                {isEditing && (
                  <div className="flex space-x-4">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          username: user.username,
                          avatar: user.avatar,
                        });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;