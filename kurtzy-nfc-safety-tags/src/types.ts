export interface Contact {
  role: string;
  name: string;
  phone: string;
}

export interface TagProfile {
  id: string;
  childName: string;
  childPhoto?: string;
  contacts: Contact[];
  tagColor: string;
  bloodGroup: string;
  age: string;
  engravingText: string;
  adEmail?: string;
  adWhatsapp?: string;
  adInstagram?: string;
  userId?: string;
}

