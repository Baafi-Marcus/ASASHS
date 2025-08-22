import React, { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { toast } from 'react-hot-toast';

// ---------- Types ----------
interface Programme {
  id: number;
  name: string;
}

interface ClassItem {
  id: number;
  class_name: string;
  form: number;
  stream: string | null;
  // If your classes_view has programme_id, this improves filtering:
  programme_id?: number;
}

interface StudentFormProps {
  onSuccess?: (studentData: { admissionNumber: string; password: string }) => void;
  programmes: Programme[];
  classes: ClassItem[];
}

// ---------- Helpers ----------
const formatEmailFromAdmission = (admission: string) =>
  `${admission.toLowerCase().replace(/\//g, '.')}` + '@asashs.edu.gh';

const generateStudentPassword = (admissionNumber: string, surname: string) => {
  const surnamePart = surname.trim().slice(0, 3).toUpperCase();
  const admissionClean = admissionNumber.replace(/\//g, '');
  // Add last two digits of birth year later if you want extra entropy
  return `${admissionClean}${surnamePart}`;
};

// Safer age calculation (considers month/day)
const isAgeBetween = (dobISO: string, min: number, max: number) => {
  const dob = new Date(dobISO);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age >= min && age <= max;
};

// ---------- Schema ----------
const studentFormSchema = z.object({
  // Personal Information
  admission_number: z.string()
    .min(1, 'Admission number is required')
    .regex(/^ASASHS\/\d{2}\/\d{4}$/, 'Must be ASASHS/YY/XXXX (e.g., ASASHS/24/0001)'),
  surname: z.string().min(1, 'Surname is required'),
  other_names: z.string().min(1, 'Other names are required'),
  date_of_birth: z.string()
    .min(1, 'Date of birth is required')
    .refine((dob) => isAgeBetween(dob, 10, 25), 'Student must be between 10 and 25 years old'),
  gender: z.enum(['M', 'F'], { required_error: 'Gender is required' }),
  nationality: z.string().default('Ghanaian'),
  hometown: z.string().min(1, 'Hometown is required'),
  district_of_origin: z.string().min(1, 'District is required'),
  region_of_origin: z.string().min(1, 'Region is required'),

  // Programme and Class
  programme_id: z.number({ required_error: 'Programme is required' }).min(1, 'Programme is required'),
  form: z.number({ required_error: 'Form is required' }).min(1).max(3, 'Form must be 1, 2, or 3'),
  stream: z.string().optional().or(z.literal('')),

  // Guardian Information
  guardian_name: z.string().min(1, 'Guardian name is required'),
  guardian_relationship: z.string().min(1, 'Relationship is required'),
  guardian_phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+233\d{9}$|^0\d{9}$/, 'Phone must be +233XXXXXXXXX or 0XXXXXXXXX'),
  guardian_phone_alt: z.string()
    .regex(/^(\+233\d{9}|0\d{9})?$/, 'Phone must be +233XXXXXXXXX or 0XXXXXXXXX')
    .optional()
    .or(z.literal('')),
  guardian_email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  guardian_address: z.string().min(1, 'Address is required'),

  // Academic History
  previous_school: z.string().min(1, 'Previous school is required'),
  graduation_year: z.number()
    .min(2000, 'Graduation year must be 2000 or later')
    .max(new Date().getFullYear(), 'Graduation year cannot be in the future'),

  // Medical Information
  known_allergies: z.string().default('None'),
  chronic_conditions: z.string().default('None'),
  blood_group: z.string()
    .regex(/^(A|B|AB|O)[+-]$/, 'Blood group must be like A+, B-, O+')
    .optional()
    .or(z.literal('')),
});

type StudentFormData = z.infer<typeof studentFormSchema>;

// ---------- Component ----------
export function StudentForm({ onSuccess, programmes, classes }: StudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ admissionNumber: string; password: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      nationality: 'Ghanaian',
      known_allergies: 'None',
      chronic_conditions: 'None',
      stream: '',
    },
  });

  const selectedProgrammeId = watch('programme_id');
  const selectedForm = watch('form');
  const selectedStream = watch('stream');

  // Prefer programme_id filtering if available; else fall back to name heuristic
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const formOk = selectedForm ? cls.form === selectedForm : true;
      const streamOk = selectedStream ? (cls.stream ?? '') === selectedStream : true;

      if (typeof cls.programme_id === 'number' && selectedProgrammeId) {
        return formOk && streamOk && cls.programme_id === selectedProgrammeId;
      }

      // Fallback: if class_name starts with programme name token (your previous heuristic)
      if (selectedProgrammeId) {
        const prog = programmes.find((p) => p.id === selectedProgrammeId)?.name ?? '';
        const classPrefix = cls.class_name.split(' ')[0];
        return formOk && streamOk && prog.includes(classPrefix);
      }

      return formOk && streamOk;
    });
  }, [classes, programmes, selectedProgrammeId, selectedForm, selectedStream]);

  const checkAdmissionNumberExists = async (admissionNumber: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('students')
      .select('admission_number')
      .eq('admission_number', admissionNumber)
      .maybeSingle();

    if (error) {
      // If this is a 406 "No rows" we can ignore; other errors should surface
      if ((error as any).code && (error as any).code !== 'PGRST116') {
        throw error;
      }
    }
    return !!data;
  };

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      // 0) Uniqueness guard
      if (await checkAdmissionNumberExists(data.admission_number)) {
        throw new Error('Admission number already exists');
      }

      // 1) Prepare account credentials
      const email = formatEmailFromAdmission(data.admission_number);
      const password = generateStudentPassword(data.admission_number, data.surname);

      // 2) Create auth user (frontend signUp assumes email confirmations configured as you expect)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: `${data.surname} ${data.other_names}`,
            role: 'student',
            must_change_password: true,
          },
        },
      });
      if (authError) throw authError;
      if (!authData?.user?.id) {
        // If your project requires email confirmation, user may be pending; adjust project settings as needed
        throw new Error('User creation pending or failed. Check email confirmation settings.');
      }

      const userId = authData.user.id;

      // 3) Resolve class target
      // Prefer direct match by programme_id + form + stream if available
      const chosenClass =
        classes.find(
          (cls) =>
            cls.form === data.form &&
            (cls.stream ?? '') === (data.stream ?? '') &&
            (typeof cls.programme_id === 'number' ? cls.programme_id === data.programme_id : true)
        ) ||
        // Fallback: heuristic using class_name prefix vs programme name
        classes.find((cls) => {
          const prog = programmes.find((p) => p.id === data.programme_id)?.name ?? '';
          return cls.form === data.form && (cls.stream ?? '') === (data.stream ?? '') && prog.includes(cls.class_name.split(' ')[0]);
        });

      if (!chosenClass) throw new Error('Selected class not found for the chosen programme/form/stream');

      // 4) Insert student profile
      const { error: studentError } = await supabase.from('students').insert({
        id: userId,
        admission_number: data.admission_number,
        programme_id: data.programme_id,
        current_class_id: chosenClass.id,
        surname: data.surname,
        other_names: data.other_names,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        nationality: data.nationality,
        hometown: data.hometown,
        district_of_origin: data.district_of_origin,
        region_of_origin: data.region_of_origin,
        guardian_name: data.guardian_name,
        guardian_relationship: data.guardian_relationship,
        guardian_phone: data.guardian_phone,
        guardian_phone_alt: data.guardian_phone_alt || null,
        guardian_email: data.guardian_email || null,
        guardian_address: data.guardian_address,
        previous_school: data.previous_school,
        graduation_year: data.graduation_year,
        known_allergies: data.known_allergies,
        chronic_conditions: data.chronic_conditions,
        blood_group: data.blood_group || null,
        enrollment_date: new Date().toISOString().split('T')[0],
        is_active: true,
      });
      if (studentError) {
        // Handle unique-violation gracefully if DB constraint also exists
        if ((studentError as any).code === '23505') {
          throw new Error('A student with this admission number already exists.');
        }
        throw studentError;
      }

      // 5) Enroll student for current academic year
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}/${currentYear + 1}`;

      const { error: enrollmentError } = await supabase.from('student_enrollments').insert({
        student_id: userId,
        class_id: chosenClass.id,
        academic_year: academicYear,
      });
      if (enrollmentError) throw enrollmentError;

      // Success UI + callback
      setGeneratedCredentials({
        admissionNumber: data.admission_number,
        password,
      });

      toast.success('Student registered successfully!');
      onSuccess?.({ admissionNumber: data.admission_number, password });

    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to register student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setGeneratedCredentials(null);
    reset();
  };

  // ---------- Success screen ----------
  if (generatedCredentials) {
    const email = formatEmailFromAdmission(generatedCredentials.admissionNumber);
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Student Registered Successfully! ✅</CardTitle>
          <CardDescription>Credentials generated for the new student</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Student Login Credentials:</h3>
            <div className="space-y-2">
              <p><strong>Admission Number:</strong> {generatedCredentials.admissionNumber}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Password:</strong> {generatedCredentials.password}</p>
            </div>
            <p className="text-sm text-green-600 mt-3">
              📝 Student must change password on first login
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleReset} variant="outline">Register Another Student</Button>
            <Button onClick={() => onSuccess?.(generatedCredentials)}>Complete</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ---------- Form ----------
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Student Registration Form</CardTitle>
        <CardDescription>Complete all fields to register a new student</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admission_number">Admission Number *</Label>
              <Input
                {...register('admission_number')}
                placeholder="ASASHS/24/0001"
                disabled={isSubmitting}
                aria-invalid={!!errors.admission_number}
              />
              {errors.admission_number && <p className="text-red-500 text-sm">{errors.admission_number.message}</p>}
            </div>

            <div>
              <Label htmlFor="surname">Surname *</Label>
              <Input {...register('surname')} disabled={isSubmitting} aria-invalid={!!errors.surname} />
              {errors.surname && <p className="text-red-500 text-sm">{errors.surname.message}</p>}
            </div>

            <div>
              <Label htmlFor="other_names">Other Names *</Label>
              <Input {...register('other_names')} disabled={isSubmitting} aria-invalid={!!errors.other_names} />
              {errors.other_names && <p className="text-red-500 text-sm">{errors.other_names.message}</p>}
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth *</Label>
              <Input type="date" {...register('date_of_birth')} disabled={isSubmitting} aria-invalid={!!errors.date_of_birth} />
              {errors.date_of_birth && <p className="text-red-500 text-sm">{errors.date_of_birth.message}</p>}
            </div>

            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={(v) => onChange(v as 'M' | 'F')} value={value ?? undefined}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
            </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              <Input {...register('nationality')} disabled={isSubmitting} />
            </div>

            <div>
              <Label htmlFor="hometown">Hometown *</Label>
              <Input {...register('hometown')} disabled={isSubmitting} aria-invalid={!!errors.hometown} />
              {errors.hometown && <p className="text-red-500 text-sm">{errors.hometown.message}</p>}
            </div>

            <div>
              <Label htmlFor="district_of_origin">District of Origin *</Label>
              <Input {...register('district_of_origin')} disabled={isSubmitting} aria-invalid={!!errors.district_of_origin} />
              {errors.district_of_origin && <p className="text-red-500 text-sm">{errors.district_of_origin.message}</p>}
            </div>

            <div>
              <Label htmlFor="region_of_origin">Region of Origin *</Label>
              <Input {...register('region_of_origin')} disabled={isSubmitting} aria-invalid={!!errors.region_of_origin} />
              {errors.region_of_origin && <p className="text-red-500 text-sm">{errors.region_of_origin.message}</p>}
            </div>
          </div>

          {/* Programme and Class */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="programme_id">Programme *</Label>
              <Controller
                control={control}
                name="programme_id"
                render={({ field: { onChange, value } }) => (
                  <Select
                    onValueChange={(v) => onChange(parseInt(v, 10))}
                    value={value ? String(value) : undefined}
                  >
                    <SelectTrigger><SelectValue placeholder="Select programme" /></SelectTrigger>
                    <SelectContent>
                      {programmes.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.programme_id && <p className="text-red-500 text-sm">{errors.programme_id.message}</p>}
            </div>

            <div>
              <Label htmlFor="form">Form *</Label>
              <Controller
                control={control}
                name="form"
                render={({ field: { onChange, value } }) => (
                  <Select
                    onValueChange={(v) => onChange(parseInt(v, 10))}
                    value={value ? String(value) : undefined}
                  >
                    <SelectTrigger><SelectValue placeholder="Select form" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Form 1</SelectItem>
                      <SelectItem value="2">Form 2</SelectItem>
                      <SelectItem value="3">Form 3</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.form && <p className="text-red-500 text-sm">{errors.form.message}</p>}
            </div>

            <div>
              <Label htmlFor="stream">Stream</Label>
              <Controller
                control={control}
                name="stream"
                render={({ field: { onChange, value } }) => (
                  <Select onValueChange={onChange} value={value ?? undefined}>
                    <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Guardian Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="guardian_name">Guardian's Name *</Label>
              <Input {...register('guardian_name')} disabled={isSubmitting} aria-invalid={!!errors.guardian_name} />
              {errors.guardian_name && <p className="text-red-500 text-sm">{errors.guardian_name.message}</p>}
            </div>

            <div>
              <Label htmlFor="guardian_relationship">Relationship *</Label>
              <Input {...register('guardian_relationship')} disabled={isSubmitting} aria-invalid={!!errors.guardian_relationship} />
              {errors.guardian_relationship && <p className="text-red-500 text-sm">{errors.guardian_relationship.message}</p>}
            </div>

            <div>
              <Label htmlFor="guardian_phone">Phone Number *</Label>
              <Input {...register('guardian_phone')} placeholder="+233XXXXXXXXX or 0XXXXXXXXX" disabled={isSubmitting} />
              {errors.guardian_phone && <p className="text-red-500 text-sm">{errors.guardian_phone.message}</p>}
            </div>

            <div>
              <Label htmlFor="guardian_phone_alt">Alternative Phone</Label>
              <Input {...register('guardian_phone_alt')} placeholder="+233XXXXXXXXX or 0XXXXXXXXX" disabled={isSubmitting} />
              {errors.guardian_phone_alt && <p className="text-red-500 text-sm">{errors.guardian_phone_alt.message}</p>}
            </div>

            <div>
              <Label htmlFor="guardian_email">Email</Label>
              <Input type="email" {...register('guardian_email')} disabled={isSubmitting} />
              {errors.guardian_email && <p className="text-red-500 text-sm">{errors.guardian_email.message}</p>}
            </div>

            <div>
              <Label htmlFor="guardian_address">Address *</Label>
              <Input {...register('guardian_address')} disabled={isSubmitting} aria-invalid={!!errors.guardian_address} />
              {errors.guardian_address && <p className="text-red-500 text-sm">{errors.guardian_address.message}</p>}
            </div>
          </div>

          {/* Academic History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="previous_school">Previous School *</Label>
              <Input {...register('previous_school')} disabled={isSubmitting} aria-invalid={!!errors.previous_school} />
              {errors.previous_school && <p className="text-red-500 text-sm">{errors.previous_school.message}</p>}
            </div>

            <div>
              <Label htmlFor="graduation_year">Graduation Year *</Label>
              <Input
                type="number"
                {...register('graduation_year', { valueAsNumber: true })}
                min={2000}
                max={new Date().getFullYear()}
                disabled={isSubmitting}
                aria-invalid={!!errors.graduation_year}
              />
              {errors.graduation_year && <p className="text-red-500 text-sm">{errors.graduation_year.message}</p>}
            </div>
          </div>

          {/* Medical */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="known_allergies">Known Allergies</Label>
              <Input {...register('known_allergies')} disabled={isSubmitting} />
            </div>

            <div>
              <Label htmlFor="chronic_conditions">Chronic Conditions</Label>
              <Input {...register('chronic_conditions')} disabled={isSubmitting} />
            </div>

            <div>
              <Label htmlFor="blood_group">Blood Group</Label>
              <Input {...register('blood_group')} placeholder="A+, B-, O+, etc." disabled={isSubmitting} aria-invalid={!!errors.blood_group} />
              {errors.blood_group && <p className="text-red-500 text-sm">{errors.blood_group.message}</p>}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Registering Student...' : 'Register Student'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
