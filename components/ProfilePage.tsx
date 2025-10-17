import * as React from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import type { User } from '../types';
import * as Lucide from 'lucide-react';

interface ProfilePageProps {
    user: User;
    onUpdateProfile: (updatedUser: User) => void;
    onLogout: () => void;
    onChangePassword: (currentPassword: string, newPassword: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateProfile, onLogout, onChangePassword }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const [name, setName] = React.useState(user.name);
    const [email, setEmail] = React.useState(user.email);
    const [bio, setBio] = React.useState(user.bio || '');
    const [profilePicture, setProfilePicture] = React.useState(user.profilePicture);
    const [birthDate, setBirthDate] = React.useState(user.birthDate || '');

    // Password change state
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [passwordError, setPasswordError] = React.useState('');

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!isEditing) {
            setName(user.name);
            setEmail(user.email);
            setBio(user.bio || '');
            setProfilePicture(user.profilePicture);
            setBirthDate(user.birthDate || '');
        }
    }, [user, isEditing]);

    const handlePictureUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        onUpdateProfile({ ...user, name, email, bio, profilePicture, birthDate });
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setIsEditing(false);
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordError('As novas senhas não coincidem.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        setPasswordError('');
        onChangePassword(currentPassword, newPassword);
        // Clear fields after submission
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="space-y-8">
            <Card>
                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                    <div className="relative flex-shrink-0 mb-4 sm:mb-0 sm:mr-6 group">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        {profilePicture ? (
                            <img src={profilePicture} alt="Foto do Perfil" className="h-28 w-28 rounded-full object-cover" />
                        ) : (
                            <div className="h-28 w-28 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-5xl font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {isEditing && (
                            <button 
                                onClick={handlePictureUpload}
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                aria-label="Alterar foto do perfil"
                            >
                                <Lucide.Camera size={24} />
                            </button>
                        )}
                    </div>
                    <div className="flex-grow">
                         <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                             <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h2>
                              {!isEditing && (
                                <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm" leftIcon={<Lucide.Edit size={16}/>}>
                                    Editar Perfil
                                </Button>
                            )}
                         </div>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{user.email}</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm max-w-md mx-auto sm:mx-0">{user.bio || 'Adicione uma bio para se apresentar.'}</p>
                    </div>
                </div>

                {isEditing && (
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                         <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Nome Completo</label>
                                    <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Bio</label>
                                <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" placeholder="Fale um pouco sobre você..."></textarea>
                            </div>
                             <div>
                                <label htmlFor="birthDate" className="block text-sm font-medium text-slate-500 dark:text-slate-400">Data de Nascimento</label>
                                <input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Usado apenas para uma surpresa especial no seu dia!</p>
                            </div>
                            <div className="flex justify-end space-x-3">
                                 <Button type="button" variant="ghost" onClick={handleCancel}>Cancelar</Button>
                                 <Button type="button" onClick={handleSave}>Salvar Alterações</Button>
                            </div>
                        </form>
                    </div>
                )}
            </Card>

            <Card>
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Alterar Senha</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">Para sua segurança, recomendamos o uso de uma senha forte.</p>
                 <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label htmlFor="current-password"className="block text-sm font-medium text-slate-500 dark:text-slate-400">Senha Atual</label>
                        <input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="new-password"className="block text-sm font-medium text-slate-500 dark:text-slate-400">Nova Senha</label>
                            <input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="confirm-password"className="block text-sm font-medium text-slate-500 dark:text-slate-400">Confirmar Nova Senha</label>
                            <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                        </div>
                    </div>
                    {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                    <div className="flex justify-end">
                        <Button type="submit">Atualizar Senha</Button>
                    </div>
                 </form>
            </Card>

             <Card className="border-red-500/50 dark:border-red-500/30">
                 <h3 className="text-xl font-bold text-red-600 dark:text-red-500">Zona de Perigo</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Ações irreversíveis que impactam sua conta.</p>
                <Button onClick={onLogout} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white" leftIcon={<Lucide.LogOut size={16}/>}>
                    Sair da Conta
                </Button>
             </Card>
        </div>
    );
};

export default ProfilePage;