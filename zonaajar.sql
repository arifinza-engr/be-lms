--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Ubuntu 17.5-1.pgdg24.04+1)
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-20 06:53:15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 24915)
-- Name: public; Type: SCHEMA; Schema: -; Owner: reffrains
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO reffrains;

--
-- TOC entry 3685 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: reffrains
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 858 (class 1247 OID 24918)
-- Name: MessageType; Type: TYPE; Schema: public; Owner: reffrains
--

CREATE TYPE public."MessageType" AS ENUM (
    'USER',
    'AI'
);


ALTER TYPE public."MessageType" OWNER TO reffrains;

--
-- TOC entry 861 (class 1247 OID 24924)
-- Name: ProgressStatus; Type: TYPE; Schema: public; Owner: reffrains
--

CREATE TYPE public."ProgressStatus" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE public."ProgressStatus" OWNER TO reffrains;

--
-- TOC entry 864 (class 1247 OID 24932)
-- Name: UserRole; Type: TYPE; Schema: public; Owner: reffrains
--

CREATE TYPE public."UserRole" AS ENUM (
    'SISWA',
    'ADMIN',
    'GURU'
);


ALTER TYPE public."UserRole" OWNER TO reffrains;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 24939)
-- Name: ai_chat_logs; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.ai_chat_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "subchapterId" uuid NOT NULL,
    message text NOT NULL,
    "messageType" public."MessageType" NOT NULL,
    "audioUrl" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_chat_logs OWNER TO reffrains;

--
-- TOC entry 218 (class 1259 OID 24948)
-- Name: ai_generated_content; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.ai_generated_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "subchapterId" uuid NOT NULL,
    content text NOT NULL,
    "audioUrl" text,
    "isInitial" boolean DEFAULT true NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_generated_content OWNER TO reffrains;

--
-- TOC entry 219 (class 1259 OID 24962)
-- Name: chapters; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.chapters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "subjectId" uuid NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chapters OWNER TO reffrains;

--
-- TOC entry 220 (class 1259 OID 24976)
-- Name: grades; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.grades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.grades OWNER TO reffrains;

--
-- TOC entry 221 (class 1259 OID 24989)
-- Name: metahuman_sessions; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.metahuman_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "subchapterId" uuid NOT NULL,
    "sessionData" jsonb NOT NULL,
    duration integer,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.metahuman_sessions OWNER TO reffrains;

--
-- TOC entry 222 (class 1259 OID 25000)
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.quiz_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "quizId" uuid NOT NULL,
    answers jsonb NOT NULL,
    score double precision NOT NULL,
    "maxScore" double precision NOT NULL,
    percentage double precision NOT NULL,
    passed boolean DEFAULT false NOT NULL,
    "timeSpent" integer,
    "startedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "completedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quiz_attempts OWNER TO reffrains;

--
-- TOC entry 223 (class 1259 OID 25011)
-- Name: quiz_questions; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.quiz_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "quizId" uuid NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL,
    "correctAnswer" character varying(10) NOT NULL,
    explanation text,
    "order" integer DEFAULT 0 NOT NULL,
    points double precision DEFAULT 1 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quiz_questions OWNER TO reffrains;

--
-- TOC entry 224 (class 1259 OID 25023)
-- Name: quizzes; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.quizzes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "subchapterId" uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "isActive" boolean DEFAULT true NOT NULL,
    "timeLimit" integer,
    "passingScore" double precision DEFAULT 70 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quizzes OWNER TO reffrains;

--
-- TOC entry 225 (class 1259 OID 25037)
-- Name: subchapter_materials; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.subchapter_materials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "subchapterId" uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "fileName" character varying(255) NOT NULL,
    "fileUrl" text NOT NULL,
    "fileType" character varying(50) NOT NULL,
    "fileSize" integer,
    "mimeType" character varying(100),
    "thumbnailUrl" text,
    duration integer,
    "uploadedBy" uuid NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subchapter_materials OWNER TO reffrains;

--
-- TOC entry 226 (class 1259 OID 25048)
-- Name: subchapters; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.subchapters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "order" integer DEFAULT 0 NOT NULL,
    "chapterId" uuid NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subchapters OWNER TO reffrains;

--
-- TOC entry 227 (class 1259 OID 25062)
-- Name: subjects; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "gradeId" uuid NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.subjects OWNER TO reffrains;

--
-- TOC entry 228 (class 1259 OID 25075)
-- Name: user_progress; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.user_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" uuid NOT NULL,
    "subchapterId" uuid NOT NULL,
    status public."ProgressStatus" DEFAULT 'NOT_STARTED'::public."ProgressStatus" NOT NULL,
    "completedAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_progress OWNER TO reffrains;

--
-- TOC entry 229 (class 1259 OID 25086)
-- Name: users; Type: TABLE; Schema: public; Owner: reffrains
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role public."UserRole" DEFAULT 'SISWA'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "refreshToken" text,
    "refreshTokenExpiresAt" timestamp without time zone,
    "resetToken" character varying(255),
    "resetTokenExpiresAt" timestamp without time zone,
    "lastLoginAt" timestamp without time zone,
    "passwordChangedAt" timestamp without time zone,
    "loginAttempts" integer DEFAULT 0 NOT NULL,
    "lockedUntil" timestamp without time zone,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "emailVerificationToken" character varying(255),
    "emailVerificationExpiresAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO reffrains;

--
-- TOC entry 3667 (class 0 OID 24939)
-- Dependencies: 217
-- Data for Name: ai_chat_logs; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.ai_chat_logs (id, "userId", "subchapterId", message, "messageType", "audioUrl", "createdAt") FROM stdin;
2089ab47-f8fc-4a9a-83f7-28281208cf35	552702f7-397a-4dcd-b01e-4009d2a2c74e	557aa861-5434-4983-8caa-62b6512880f1	Bisakah dijelaskan step by step?	USER	\N	2025-08-19 21:50:00.814194
5d704be6-5ad4-4276-bc93-8979495d13ef	552702f7-397a-4dcd-b01e-4009d2a2c74e	557aa861-5434-4983-8caa-62b6512880f1	Ada beberapa cara untuk mengingat rumus ini...	AI	\N	2025-08-19 21:50:00.823283
169ff1b0-821b-42e7-9911-3234e400cfff	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	Bagaimana cara mengingat rumus ini?	USER	\N	2025-08-19 21:50:00.830035
f540c3b6-f1a3-426f-a0c2-08ab80b6b123	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	Ada beberapa cara untuk mengingat rumus ini...	AI	\N	2025-08-19 21:50:00.840631
e4468e0e-44d1-4186-a454-e241d19e6776	faea2f17-071c-4b09-8d66-47aa7f1c96b5	88028e3f-58fb-49e5-84d8-5fc328330f80	Bagaimana cara menyelesaikan soal ini?	USER	\N	2025-08-19 21:50:00.848937
e4a3d145-425c-4603-b076-f26ea473ec6e	faea2f17-071c-4b09-8d66-47aa7f1c96b5	88028e3f-58fb-49e5-84d8-5fc328330f80	Ada beberapa cara untuk mengingat rumus ini...	AI	\N	2025-08-19 21:50:00.856627
007f3ad8-ad9c-407c-a142-3f6e906b8a59	faea2f17-071c-4b09-8d66-47aa7f1c96b5	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Bagaimana cara menyelesaikan soal ini?	USER	\N	2025-08-19 21:50:00.863034
20aed34d-6dae-4bd7-95ad-68ed0118512c	faea2f17-071c-4b09-8d66-47aa7f1c96b5	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Tidak apa-apa, mari kita ulangi dari konsep dasar.	AI	\N	2025-08-19 21:50:00.869902
63840e6a-2698-4962-b52b-fdec8c09d4e9	ea36b494-642c-4de1-b805-bee4428f1971	88028e3f-58fb-49e5-84d8-5fc328330f80	Bagaimana cara menyelesaikan soal ini?	USER	\N	2025-08-19 21:50:00.875113
5bc6a060-d7f4-448d-9991-176edc09bd06	ea36b494-642c-4de1-b805-bee4428f1971	88028e3f-58fb-49e5-84d8-5fc328330f80	Tentu! Mari kita bahas konsep ini dari dasar.	AI	\N	2025-08-19 21:50:00.881896
b4b9f846-8ce4-4759-a156-2db38a00785b	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Apa rumus yang digunakan?	USER	\N	2025-08-19 21:50:00.890062
8d923bdd-1989-4b45-9f1d-be4861dfa435	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Baik, saya akan jelaskan step by step dengan detail.	AI	\N	2025-08-19 21:50:00.895646
a9a09cb9-70df-4d4c-ab12-98132f3de623	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	b380e8dc-9a61-481b-8ab0-6a63758810b6	Bagaimana cara mengingat rumus ini?	USER	\N	2025-08-19 21:50:00.902717
cf407900-1f98-4431-8551-6ac10fa67b12	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	b380e8dc-9a61-481b-8ab0-6a63758810b6	Ada beberapa cara untuk mengingat rumus ini...	AI	\N	2025-08-19 21:50:00.91045
e6786a16-e547-43de-ae1e-a71ae5596fd2	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	88028e3f-58fb-49e5-84d8-5fc328330f80	Berikan contoh soal lainnya	USER	\N	2025-08-19 21:50:00.915799
5dc0c29e-49f5-4eaa-ad2d-74b69b898b6f	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	88028e3f-58fb-49e5-84d8-5fc328330f80	Ada beberapa cara untuk mengingat rumus ini...	AI	\N	2025-08-19 21:50:00.921701
e2a26438-37bd-45f9-bf6d-6c78bb7537b7	ba840c09-cce3-4f79-bf56-e8f5d119b651	88028e3f-58fb-49e5-84d8-5fc328330f80	Berikan contoh soal lainnya	USER	\N	2025-08-19 21:50:00.927914
70ef3136-1665-496c-ad5b-c6bbd82efe83	ba840c09-cce3-4f79-bf56-e8f5d119b651	88028e3f-58fb-49e5-84d8-5fc328330f80	Baik, saya akan menjelaskan langkah-langkahnya dengan detail.	AI	\N	2025-08-19 21:50:00.933624
b2f34aad-93d1-4af6-9d3f-da7dec233e35	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	b380e8dc-9a61-481b-8ab0-6a63758810b6	Berikan contoh soal lainnya	USER	\N	2025-08-19 21:50:00.94005
78e42c00-ce00-4ff1-ac34-68c8a61bd0dc	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	b380e8dc-9a61-481b-8ab0-6a63758810b6	Baik, saya akan menjelaskan langkah-langkahnya dengan detail.	AI	\N	2025-08-19 21:50:00.944664
43f19f0f-543f-4c58-aefb-b122265fd9d4	ba840c09-cce3-4f79-bf56-e8f5d119b651	c0854731-59ec-4a91-b357-2a2571a7c0d0	Bagaimana cara menyelesaikan soal ini?	USER	\N	2025-08-19 21:50:00.951393
8a8ce3f3-2656-4fb8-badd-e903d56c7bbb	ba840c09-cce3-4f79-bf56-e8f5d119b651	c0854731-59ec-4a91-b357-2a2571a7c0d0	Aplikasi materi ini sangat luas, contohnya...	AI	\N	2025-08-19 21:50:00.957317
62a4e55e-2581-4bdb-ae5b-dd4404d63706	a8851556-7c41-45b4-906b-d4db56f0dae2	e703675f-c6b0-4000-a9df-56758e33236b	Bagaimana cara mengingat rumus ini?	USER	\N	2025-08-19 21:50:00.963625
f4bdc0bb-5086-4de0-b9e2-af7d0eb5f339	a8851556-7c41-45b4-906b-d4db56f0dae2	e703675f-c6b0-4000-a9df-56758e33236b	Ada beberapa cara untuk mengingat rumus ini...	AI	\N	2025-08-19 21:50:00.969465
56f484c2-62d4-40c6-b93a-b5cabeacc7ad	e568bbee-20af-4df1-b779-ee29149510c3	6b3395b5-2a30-4dbd-9f94-04e2af015118	Berikan contoh soal lainnya	USER	\N	2025-08-19 21:50:00.975353
efba931c-1ddd-4c92-a5f7-4dacc763ac4c	e568bbee-20af-4df1-b779-ee29149510c3	6b3395b5-2a30-4dbd-9f94-04e2af015118	Berikut beberapa contoh soal yang bisa membantu pemahaman Anda.	AI	\N	2025-08-19 21:50:00.980207
ab9a157c-9d74-4178-a91a-cc346ff1fbdc	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	557aa861-5434-4983-8caa-62b6512880f1	Bagaimana cara mengingat rumus ini?	USER	\N	2025-08-19 21:50:00.987979
0d493f16-8b54-49f4-836d-527ef9241dbe	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	557aa861-5434-4983-8caa-62b6512880f1	Berikut beberapa contoh soal yang bisa membantu pemahaman Anda.	AI	\N	2025-08-19 21:50:00.992583
3240e6d2-a97d-4006-936b-b2750f913c98	ba840c09-cce3-4f79-bf56-e8f5d119b651	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Berikan contoh soal lainnya	USER	\N	2025-08-19 21:50:00.998802
108c2e6a-d3cc-485e-af84-754685097fe2	ba840c09-cce3-4f79-bf56-e8f5d119b651	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Tentu! Mari kita bahas konsep ini dari dasar.	AI	\N	2025-08-19 21:50:01.004691
f933554b-a656-47a3-ab45-068e258f0f4f	faea2f17-071c-4b09-8d66-47aa7f1c96b5	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Bisakah dijelaskan step by step?	USER	\N	2025-08-19 21:50:01.011165
c63142ca-7c0a-4849-a8fa-d9b12babbcd9	faea2f17-071c-4b09-8d66-47aa7f1c96b5	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Berikut beberapa contoh soal yang bisa membantu pemahaman Anda.	AI	\N	2025-08-19 21:50:01.01743
3aa09654-405b-429d-89c7-148744b68b7c	552702f7-397a-4dcd-b01e-4009d2a2c74e	88028e3f-58fb-49e5-84d8-5fc328330f80	Bisakah dijelaskan step by step?	USER	\N	2025-08-19 21:50:01.02212
2bed83f7-630b-4b72-b9ff-fdecfe4a9205	552702f7-397a-4dcd-b01e-4009d2a2c74e	88028e3f-58fb-49e5-84d8-5fc328330f80	Berikut beberapa contoh soal yang bisa membantu pemahaman Anda.	AI	\N	2025-08-19 21:50:01.028632
6e86c45a-3750-45f2-89b5-ba84a467d243	750ad13a-23c8-4f90-98f1-a3af8c91b43c	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Bisakah dijelaskan lebih detail?	USER	\N	2025-08-19 21:50:01.033397
8ab8c5a7-c425-4e90-a2f8-aa8e3b0c951e	750ad13a-23c8-4f90-98f1-a3af8c91b43c	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Aplikasi materi ini sangat luas, contohnya...	AI	\N	2025-08-19 21:50:01.038005
7496d994-7fa6-427f-a416-3eaea7014fc1	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Apa rumus yang digunakan?	USER	\N	2025-08-19 21:50:01.043008
f6398f99-cafb-413d-acad-6c6a5ac4a74e	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Tentu! Mari kita bahas konsep ini dari dasar.	AI	\N	2025-08-19 21:50:01.047384
34581275-56f5-4226-932f-c6081bd6b4ac	ba840c09-cce3-4f79-bf56-e8f5d119b651	e703675f-c6b0-4000-a9df-56758e33236b	Saya masih bingung dengan konsep ini	USER	\N	2025-08-19 21:50:01.053733
008e365c-42a5-4540-9656-069f620edb51	ba840c09-cce3-4f79-bf56-e8f5d119b651	e703675f-c6b0-4000-a9df-56758e33236b	Tentu! Mari kita bahas konsep ini dari dasar.	AI	\N	2025-08-19 21:50:01.059446
cfc6d74b-99ab-42fa-8ce6-66fccfdea027	b6eacc9f-ddea-41b7-acae-42e45201fae1	dc8f1873-59c1-46d0-8479-478040fb2e2d	Bagaimana cara mengingat rumus ini?	USER	\N	2025-08-19 21:50:01.065169
78ac889b-ad4d-4a29-acfa-4bec7ad62d02	b6eacc9f-ddea-41b7-acae-42e45201fae1	dc8f1873-59c1-46d0-8479-478040fb2e2d	Rumus yang digunakan adalah... Mari saya jelaskan.	AI	\N	2025-08-19 21:50:01.070038
1c8cb266-9407-468d-9fe0-c434289592a6	552702f7-397a-4dcd-b01e-4009d2a2c74e	557aa861-5434-4983-8caa-62b6512880f1	Bisakah dijelaskan lebih detail?	USER	\N	2025-08-19 21:50:01.075891
62389b69-1fe0-4dd9-b290-a7be43f2c279	552702f7-397a-4dcd-b01e-4009d2a2c74e	557aa861-5434-4983-8caa-62b6512880f1	Tentu! Mari kita bahas konsep ini dari dasar.	AI	\N	2025-08-19 21:50:01.080702
2ba86aca-bcca-4ff2-b0de-ee412b69a0fb	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	6b3395b5-2a30-4dbd-9f94-04e2af015118	Saya masih bingung dengan konsep ini	USER	\N	2025-08-19 21:50:01.086778
6a529e20-d0f9-4a2c-a80b-682ccc5eb403	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	6b3395b5-2a30-4dbd-9f94-04e2af015118	Berikut beberapa contoh soal yang bisa membantu pemahaman Anda.	AI	\N	2025-08-19 21:50:01.091589
dd174d40-686f-456a-a207-59cf137e0275	393361ca-ff50-43a1-81f9-c4093262fc19	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Bisakah dijelaskan step by step?	USER	\N	2025-08-19 21:50:01.096187
b918cae0-a75d-4f0f-8ffd-cd28c188a254	393361ca-ff50-43a1-81f9-c4093262fc19	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Aplikasi materi ini sangat luas, contohnya...	AI	\N	2025-08-19 21:50:01.100926
8e0785c3-d714-4428-8981-458774340daa	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	c0854731-59ec-4a91-b357-2a2571a7c0d0	Saya masih bingung dengan konsep ini	USER	\N	2025-08-19 21:50:01.107048
af46b6a8-5579-440e-b587-35e2cf1f6db8	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	c0854731-59ec-4a91-b357-2a2571a7c0d0	Tentu! Mari kita bahas konsep ini dari dasar.	AI	\N	2025-08-19 21:50:01.114487
30f11fbf-4b7f-424b-825f-50f4a3a54a14	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	e703675f-c6b0-4000-a9df-56758e33236b	Bagaimana cara mengingat rumus ini?	USER	\N	2025-08-19 21:50:01.119958
aaf21f48-f24c-454b-a65d-d078b5dcb1e5	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	e703675f-c6b0-4000-a9df-56758e33236b	Baik, saya akan menjelaskan langkah-langkahnya dengan detail.	AI	\N	2025-08-19 21:50:01.124721
3b26433d-bb0c-4681-951c-ec2c9faee5bf	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	e703675f-c6b0-4000-a9df-56758e33236b	Berikan contoh soal lainnya	USER	\N	2025-08-19 21:50:01.129367
0df7cc31-b6ad-4fc2-aba7-d6b9767e2e33	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	e703675f-c6b0-4000-a9df-56758e33236b	Tidak apa-apa, mari kita ulangi dari konsep dasar.	AI	\N	2025-08-19 21:50:01.135353
5a4cf8df-8e5f-499b-a7bc-cf48f6790ef6	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Saya masih bingung dengan konsep ini	USER	\N	2025-08-19 21:50:01.140341
0cb49474-f444-4ca9-962f-58a3f4516115	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Tentu! Mari kita bahas konsep ini dari dasar.	AI	\N	2025-08-19 21:50:01.146276
888c4949-3a39-42df-9dba-7111cb1b1369	ea36b494-642c-4de1-b805-bee4428f1971	dc8f1873-59c1-46d0-8479-478040fb2e2d	Berikan contoh soal lainnya	USER	\N	2025-08-19 21:50:01.151467
986e8ce3-abb9-4919-95ce-cfe4163aa52d	ea36b494-642c-4de1-b805-bee4428f1971	dc8f1873-59c1-46d0-8479-478040fb2e2d	Baik, saya akan jelaskan step by step dengan detail.	AI	\N	2025-08-19 21:50:01.161236
7018fb20-482f-47d7-ba34-a9e6f14fbefa	a8851556-7c41-45b4-906b-d4db56f0dae2	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Saya masih bingung dengan konsep ini	USER	\N	2025-08-19 21:50:01.170589
23fbe166-b884-4c11-991b-15915ad565d5	a8851556-7c41-45b4-906b-d4db56f0dae2	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Baik, saya akan jelaskan step by step dengan detail.	AI	\N	2025-08-19 21:50:01.176695
\.


--
-- TOC entry 3668 (class 0 OID 24948)
-- Dependencies: 218
-- Data for Name: ai_generated_content; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.ai_generated_content (id, "subchapterId", content, "audioUrl", "isInitial", version, "createdAt", "updatedAt") FROM stdin;
e07a407a-1ae7-4bd8-8b5c-e2e6590456f7	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	# Persamaan Linear\n\nPersamaan linear satu variabel dan sistem persamaan linear\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar persamaan linear yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar persamaan linear\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nPersamaan Linear adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.274937	2025-08-19 21:49:59.274937
d4b4f25e-a96c-4c9d-89c0-50832ef58001	557aa861-5434-4983-8caa-62b6512880f1	# Persamaan Kuadrat\n\nPersamaan kuadrat, diskriminan, dan akar-akar persamaan\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar persamaan kuadrat yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar persamaan kuadrat\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nPersamaan Kuadrat adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.285448	2025-08-19 21:49:59.285448
0c128da4-f605-4289-814a-324ba5d33f3e	373f873b-1a83-4d7f-9dec-5aa36b7daadc	# Pertidaksamaan\n\nPertidaksamaan linear dan kuadrat\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar pertidaksamaan yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar pertidaksamaan\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nPertidaksamaan adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.292361	2025-08-19 21:49:59.292361
0043e9b1-a30f-4990-89b1-b2d5c5c2395c	c0854731-59ec-4a91-b357-2a2571a7c0d0	# Bangun Datar\n\nLuas dan keliling bangun datar\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar bangun datar yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar bangun datar\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nBangun Datar adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.301117	2025-08-19 21:49:59.301117
31b8ef98-c8d5-4622-ac41-2a80c281f605	6b3395b5-2a30-4dbd-9f94-04e2af015118	# Bangun Ruang\n\nVolume dan luas permukaan bangun ruang\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar bangun ruang yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar bangun ruang\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nBangun Ruang adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.313553	2025-08-19 21:49:59.313553
71e844e0-278f-491f-a9e2-394a9ae7c671	88028e3f-58fb-49e5-84d8-5fc328330f80	# Teorema Pythagoras\n\nTeorema Pythagoras dan aplikasinya\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar teorema pythagoras yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar teorema pythagoras\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nTeorema Pythagoras adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.322661	2025-08-19 21:49:59.322661
38ef4972-ec3a-490e-9780-8e12ee657a23	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	# Fungsi Trigonometri\n\nSin, cos, tan dan fungsi trigonometri lainnya\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar fungsi trigonometri yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar fungsi trigonometri\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nFungsi Trigonometri adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.330084	2025-08-19 21:49:59.330084
a7ff3976-1874-42b2-a87a-88d463e349ac	e703675f-c6b0-4000-a9df-56758e33236b	# Identitas Trigonometri\n\nIdentitas dan rumus trigonometri\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar identitas trigonometri yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar identitas trigonometri\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nIdentitas Trigonometri adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.337932	2025-08-19 21:49:59.337932
b51f282f-d4c9-4138-a60b-08eeb696b09c	b380e8dc-9a61-481b-8ab0-6a63758810b6	# Aplikasi Trigonometri\n\nPenerapan trigonometri dalam kehidupan\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar aplikasi trigonometri yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar aplikasi trigonometri\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nAplikasi Trigonometri adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.344361	2025-08-19 21:49:59.344361
b931b671-7533-4d8d-8b45-ed45d4d26c17	dc8f1873-59c1-46d0-8479-478040fb2e2d	# Gerak Lurus\n\nGerak lurus beraturan dan berubah beraturan\n\n## Penjelasan Materi:\nMateri ini membahas konsep dasar gerak lurus yang merupakan bagian penting dalam pembelajaran. \n\n## Tujuan Pembelajaran:\n1. Memahami konsep dasar gerak lurus\n2. Mampu menerapkan rumus dan teorema yang relevan\n3. Menyelesaikan soal-soal terkait materi ini\n4. Mengaplikasikan dalam kehidupan sehari-hari\n\n## Contoh Soal:\nAkan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.\n\n## Rangkuman:\nGerak Lurus adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.	\N	t	1	2025-08-19 21:49:59.351476	2025-08-19 21:49:59.351476
\.


--
-- TOC entry 3669 (class 0 OID 24962)
-- Dependencies: 219
-- Data for Name: chapters; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.chapters (id, title, description, "order", "subjectId", "isActive", "createdAt", "updatedAt") FROM stdin;
ada9f006-1de9-456c-b2ff-01861b7518d0	Aljabar	Konsep dasar aljabar, persamaan, dan pertidaksamaan	1	d9900b4c-46c5-46f9-acc2-ab2045dbfd71	t	2025-08-19 21:49:58.825155	2025-08-19 21:49:58.825155
b6cb412e-77f6-4ce7-a86b-051d930a56a3	Geometri	Geometri bidang dan ruang, teorema Pythagoras	2	d9900b4c-46c5-46f9-acc2-ab2045dbfd71	t	2025-08-19 21:49:58.837557	2025-08-19 21:49:58.837557
c7a3084e-4189-4c4d-9f5c-010f9d65b02a	Trigonometri	Fungsi trigonometri, identitas, dan aplikasinya	3	d9900b4c-46c5-46f9-acc2-ab2045dbfd71	t	2025-08-19 21:49:58.845745	2025-08-19 21:49:58.845745
c8507a26-4ac4-4f47-9a48-96b576f94125	Mekanika	Gerak, gaya, dan hukum Newton	1	f4d3c764-9b22-4253-95cb-92a8af51e54b	t	2025-08-19 21:49:58.859474	2025-08-19 21:49:58.859474
2dd483b9-6f81-48e9-a655-83d1e30236ae	Termodinamika	Suhu, kalor, dan hukum termodinamika	2	f4d3c764-9b22-4253-95cb-92a8af51e54b	t	2025-08-19 21:49:58.867976	2025-08-19 21:49:58.867976
5c3ddbfd-662c-4c69-8f64-56eab8736931	Gelombang	Gelombang mekanik dan elektromagnetik	3	f4d3c764-9b22-4253-95cb-92a8af51e54b	t	2025-08-19 21:49:58.876709	2025-08-19 21:49:58.876709
abb0c2cb-438c-4014-95d3-1d83253544dd	Struktur Atom	Model atom, konfigurasi elektron, dan tabel periodik	1	a845f9dc-fd0e-4ef3-a2ff-54c175926074	t	2025-08-19 21:49:58.886771	2025-08-19 21:49:58.886771
6542d460-583e-49b6-8750-bbd69f5a6e8b	Ikatan Kimia	Ikatan ion, kovalen, dan logam	2	a845f9dc-fd0e-4ef3-a2ff-54c175926074	t	2025-08-19 21:49:58.894127	2025-08-19 21:49:58.894127
4db0a759-7154-492b-aa06-43d8accf423a	Stoikiometri	Perhitungan kimia dan reaksi	3	a845f9dc-fd0e-4ef3-a2ff-54c175926074	t	2025-08-19 21:49:58.904559	2025-08-19 21:49:58.904559
f25a1c7e-67bb-42ba-9499-b2585911b8c4	Limit	Konsep limit fungsi dan kontinuitas	1	bfc278e7-a8c3-4c0c-ab4b-e46c3bc44446	t	2025-08-19 21:49:58.911591	2025-08-19 21:49:58.911591
f124a3f9-79fb-4cf2-a8e3-127cb0486e14	Turunan	Diferensial dan aplikasinya	2	bfc278e7-a8c3-4c0c-ab4b-e46c3bc44446	t	2025-08-19 21:49:58.918976	2025-08-19 21:49:58.918976
af87ce97-a77f-4707-9946-acdffa72d710	Integral	Integral tak tentu dan tentu	3	bfc278e7-a8c3-4c0c-ab4b-e46c3bc44446	t	2025-08-19 21:49:58.926121	2025-08-19 21:49:58.926121
0ca644cb-e747-40a2-beac-e5875ede943d	Listrik Statis	Muatan listrik dan medan listrik	1	3a2ba62f-8839-4aba-9011-a6dfdec174bb	t	2025-08-19 21:49:58.934053	2025-08-19 21:49:58.934053
c17189c4-fb9c-48ef-a7e9-d0ea1befeb9b	Listrik Dinamis	Arus listrik dan rangkaian	2	3a2ba62f-8839-4aba-9011-a6dfdec174bb	t	2025-08-19 21:49:58.941803	2025-08-19 21:49:58.941803
593ab0df-94e1-4ac7-ad0b-4df4542bbbaf	Kemagnetan	Medan magnet dan induksi elektromagnetik	3	3a2ba62f-8839-4aba-9011-a6dfdec174bb	t	2025-08-19 21:49:58.950817	2025-08-19 21:49:58.950817
524139e6-0820-4723-bae3-902d9ff77673	Larutan	Sifat koligatif dan larutan elektrolit	1	b36b2c2c-50af-46df-a75c-bb2c0b300ff7	t	2025-08-19 21:49:58.962316	2025-08-19 21:49:58.962316
30244c29-bb8e-404d-9b9c-f3a7576660a7	Kesetimbangan	Kesetimbangan kimia dan asam basa	2	b36b2c2c-50af-46df-a75c-bb2c0b300ff7	t	2025-08-19 21:49:58.97131	2025-08-19 21:49:58.97131
394c1217-bb17-475c-8542-820e72a5e857	Termokimia	Energi dalam reaksi kimia	3	b36b2c2c-50af-46df-a75c-bb2c0b300ff7	t	2025-08-19 21:49:58.979607	2025-08-19 21:49:58.979607
5823b710-a09e-495b-b881-5635a18b201e	Integral Lanjut	Teknik integrasi dan aplikasi	1	fdbfcb7c-e29d-4953-a592-96fff9c565a1	t	2025-08-19 21:49:58.986591	2025-08-19 21:49:58.986591
dc097f6b-a561-45f4-ab4f-df693fccadec	Statistika	Analisis data dan distribusi	2	fdbfcb7c-e29d-4953-a592-96fff9c565a1	t	2025-08-19 21:49:58.992726	2025-08-19 21:49:58.992726
d45cec94-df18-4a3c-9d0c-3854bc229e82	Peluang	Probabilitas dan kombinatorik	3	fdbfcb7c-e29d-4953-a592-96fff9c565a1	t	2025-08-19 21:49:58.999866	2025-08-19 21:49:58.999866
733a22c9-3bf1-422f-906a-0f19b8769a10	Fisika Modern	Teori relativitas dan fisika kuantum	1	ff8d855c-6880-4265-a66d-7b3868b71446	t	2025-08-19 21:49:59.010986	2025-08-19 21:49:59.010986
574ec5ad-66d3-4225-a5c5-6f7ed4e3d98c	Fisika Atom	Struktur atom dan spektrum	2	ff8d855c-6880-4265-a66d-7b3868b71446	t	2025-08-19 21:49:59.017631	2025-08-19 21:49:59.017631
8259012f-0e21-4b93-b8e2-e66374eb4477	Fisika Inti	Radioaktivitas dan reaksi inti	3	ff8d855c-6880-4265-a66d-7b3868b71446	t	2025-08-19 21:49:59.024506	2025-08-19 21:49:59.024506
6277a0fc-f3be-4823-aa8b-7c26a9649b88	Kimia Organik	Senyawa karbon dan reaksinya	1	e73f492d-17a4-469b-8d71-03dc7e2e524f	t	2025-08-19 21:49:59.032245	2025-08-19 21:49:59.032245
e6c588c7-6511-47f8-88f9-b4835a846f40	Polimer	Makromolekul dan aplikasinya	2	e73f492d-17a4-469b-8d71-03dc7e2e524f	t	2025-08-19 21:49:59.039207	2025-08-19 21:49:59.039207
4c86f7b4-d6d2-4c94-81ff-d1a6184db192	Biokimia	Kimia dalam sistem biologis	3	e73f492d-17a4-469b-8d71-03dc7e2e524f	t	2025-08-19 21:49:59.046119	2025-08-19 21:49:59.046119
\.


--
-- TOC entry 3670 (class 0 OID 24976)
-- Dependencies: 220
-- Data for Name: grades; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.grades (id, title, description, "isActive", "createdAt", "updatedAt") FROM stdin;
b0f6f766-cbe9-41f1-9330-c72e2318f133	Kelas 10 SMA	Kelas X - Semester 1 & 2	t	2025-08-19 21:49:58.709356	2025-08-19 21:49:58.709356
e5ced14e-26df-4bc4-8520-06a7bced571b	Kelas 11 SMA	Kelas XI - Semester 1 & 2	t	2025-08-19 21:49:58.719127	2025-08-19 21:49:58.719127
77fcfae4-61a8-4594-a26c-7c8e28e3807e	Kelas 12 SMA	Kelas XII - Semester 1 & 2	t	2025-08-19 21:49:58.727314	2025-08-19 21:49:58.727314
\.


--
-- TOC entry 3671 (class 0 OID 24989)
-- Dependencies: 221
-- Data for Name: metahuman_sessions; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.metahuman_sessions (id, "userId", "subchapterId", "sessionData", duration, status, "createdAt", "updatedAt") FROM stdin;
e52cc279-a476-47d4-ace5-4e1ad5591a3c	d782a2ca-e67c-4796-8829-9277a76515a9	373f873b-1a83-4d7f-9dec-5aa36b7daadc	{"sessionId": "session_001", "interactions": 21, "engagement_score": 76, "topics_discussed": ["topic_pertidaksamaan"]}	613	COMPLETED	2025-08-19 21:50:01.184724	2025-08-19 21:50:01.184724
a06fc0ec-2dc0-49dd-94c6-76258999fb5a	d782a2ca-e67c-4796-8829-9277a76515a9	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	{"sessionId": "session_002", "interactions": 11, "engagement_score": 80, "topics_discussed": ["topic_fungsi_trigonometri"]}	649	COMPLETED	2025-08-19 21:50:01.194615	2025-08-19 21:50:01.194615
d415228f-6e8d-4ce9-a42e-f86a0d1f74bf	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	88028e3f-58fb-49e5-84d8-5fc328330f80	{"sessionId": "session_003", "interactions": 17, "engagement_score": 78, "topics_discussed": ["topic_teorema_pythagoras"]}	1616	COMPLETED	2025-08-19 21:50:01.200319	2025-08-19 21:50:01.200319
1d7728d2-ce86-41a8-ba6c-45fd639287a6	b6eacc9f-ddea-41b7-acae-42e45201fae1	88028e3f-58fb-49e5-84d8-5fc328330f80	{"sessionId": "session_004", "interactions": 9, "engagement_score": 96, "topics_discussed": ["topic_teorema_pythagoras"]}	1207	COMPLETED	2025-08-19 21:50:01.207942	2025-08-19 21:50:01.207942
7ec679f7-7073-4ce2-b3dc-be8cae4bb1f2	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	557aa861-5434-4983-8caa-62b6512880f1	{"sessionId": "session_005", "interactions": 15, "engagement_score": 84, "topics_discussed": ["topic_persamaan_kuadrat"]}	2107	COMPLETED	2025-08-19 21:50:01.219163	2025-08-19 21:50:01.219163
122edfca-eeb6-4415-93c5-0f19a8362c72	e568bbee-20af-4df1-b779-ee29149510c3	c0854731-59ec-4a91-b357-2a2571a7c0d0	{"sessionId": "session_006", "interactions": 6, "engagement_score": 93, "topics_discussed": ["topic_bangun_datar"]}	2287	ACTIVE	2025-08-19 21:50:01.225185	2025-08-19 21:50:01.225185
126c8225-5a0f-43b2-b8dc-3392fa94cc36	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	{"sessionId": "session_007", "interactions": 7, "engagement_score": 90, "topics_discussed": ["topic_fungsi_trigonometri"]}	929	COMPLETED	2025-08-19 21:50:01.231841	2025-08-19 21:50:01.231841
6cbddd14-4335-4f1a-bcbf-05ae3955ac1c	a8851556-7c41-45b4-906b-d4db56f0dae2	6b3395b5-2a30-4dbd-9f94-04e2af015118	{"sessionId": "session_008", "interactions": 9, "engagement_score": 77, "topics_discussed": ["topic_bangun_ruang"]}	1722	COMPLETED	2025-08-19 21:50:01.238845	2025-08-19 21:50:01.238845
1288e923-af7e-4d62-a424-92bb0836f039	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	6b3395b5-2a30-4dbd-9f94-04e2af015118	{"sessionId": "session_009", "interactions": 5, "engagement_score": 71, "topics_discussed": ["topic_bangun_ruang"]}	1423	COMPLETED	2025-08-19 21:50:01.244824	2025-08-19 21:50:01.244824
a4bdab72-3012-40b5-9133-472ef8f49ebd	a8851556-7c41-45b4-906b-d4db56f0dae2	c0854731-59ec-4a91-b357-2a2571a7c0d0	{"sessionId": "session_010", "interactions": 21, "engagement_score": 95, "topics_discussed": ["topic_bangun_datar"]}	618	ACTIVE	2025-08-19 21:50:01.253607	2025-08-19 21:50:01.253607
3417f6c0-1a7d-4ec5-8c3a-2c26ee430cda	b6eacc9f-ddea-41b7-acae-42e45201fae1	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	{"sessionId": "session_011", "interactions": 8, "engagement_score": 79, "topics_discussed": ["topic_persamaan_linear"]}	1757	COMPLETED	2025-08-19 21:50:01.262623	2025-08-19 21:50:01.262623
b5c8ae4c-0607-4325-83dd-664662e201a1	b6eacc9f-ddea-41b7-acae-42e45201fae1	e703675f-c6b0-4000-a9df-56758e33236b	{"sessionId": "session_012", "interactions": 18, "engagement_score": 91, "topics_discussed": ["topic_identitas_trigonometri"]}	1361	COMPLETED	2025-08-19 21:50:01.268489	2025-08-19 21:50:01.268489
21c51eb5-9f30-44d5-8b4e-13c128cf366f	ba840c09-cce3-4f79-bf56-e8f5d119b651	557aa861-5434-4983-8caa-62b6512880f1	{"sessionId": "session_013", "interactions": 8, "engagement_score": 98, "topics_discussed": ["topic_persamaan_kuadrat"]}	1744	COMPLETED	2025-08-19 21:50:01.273277	2025-08-19 21:50:01.273277
5b8597b6-5e68-4b34-a088-6b1cb86b30d5	393361ca-ff50-43a1-81f9-c4093262fc19	557aa861-5434-4983-8caa-62b6512880f1	{"sessionId": "session_014", "interactions": 20, "engagement_score": 88, "topics_discussed": ["topic_persamaan_kuadrat"]}	1760	COMPLETED	2025-08-19 21:50:01.278581	2025-08-19 21:50:01.278581
f29d39a5-ca65-44b1-abda-b06acd1e9f72	750ad13a-23c8-4f90-98f1-a3af8c91b43c	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	{"sessionId": "session_015", "interactions": 20, "engagement_score": 89, "topics_discussed": ["topic_persamaan_linear"]}	2252	COMPLETED	2025-08-19 21:50:01.285986	2025-08-19 21:50:01.285986
\.


--
-- TOC entry 3672 (class 0 OID 25000)
-- Dependencies: 222
-- Data for Name: quiz_attempts; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.quiz_attempts (id, "userId", "quizId", answers, score, "maxScore", percentage, passed, "timeSpent", "startedAt", "completedAt") FROM stdin;
ecc12ec8-9047-4686-b966-313eaf92d290	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	42c57716-935e-4dd6-a8df-67fbe00f043b	{"1": "A", "2": "B", "3": "C", "4": "D"}	66	100	66	f	1312	2025-08-19 04:40:16.124	2025-08-19 14:50:00.481
176f6775-24e9-479a-b7ae-d5e27584c252	393361ca-ff50-43a1-81f9-c4093262fc19	3be4b268-1bee-460d-9d71-342e29fb7a20	{"1": "A", "2": "B", "3": "C", "4": "D"}	70	100	70	t	600	2025-08-18 23:08:25.374	2025-08-19 14:50:00.481
805ec8ca-7868-4b3d-8fe3-1db86176578f	a8851556-7c41-45b4-906b-d4db56f0dae2	3be4b268-1bee-460d-9d71-342e29fb7a20	{"1": "A", "2": "B", "3": "C", "4": "D"}	73	100	73	t	1663	2025-08-19 00:19:11.56	2025-08-19 14:50:00.481
30a4cab9-a808-4a4d-990e-be90c96817e4	393361ca-ff50-43a1-81f9-c4093262fc19	9e956b4d-55ff-46ea-8ed5-389147571b4b	{"1": "A", "2": "B", "3": "C", "4": "D"}	60	100	60	f	1669	2025-08-19 10:27:03.56	2025-08-19 14:50:00.481
2a201378-3ad7-4ecf-af35-3e3701dd9f01	faea2f17-071c-4b09-8d66-47aa7f1c96b5	42c57716-935e-4dd6-a8df-67fbe00f043b	{"1": "A", "2": "B", "3": "C", "4": "D"}	80	100	80	t	981	2025-08-19 03:01:01.992	2025-08-19 14:50:00.481
043055af-a952-4a2b-9d37-f71782474731	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	f6270ed1-38b2-4109-a0b3-289926f4a543	{"1": "A", "2": "B", "3": "C", "4": "D"}	73	100	73	t	1551	2025-08-19 14:17:10.527	2025-08-19 14:50:00.481
5b1ca362-5213-49de-9f5b-ad5b57583995	e568bbee-20af-4df1-b779-ee29149510c3	8f622a74-2a70-42f3-8a90-f9ab06738eb4	{"1": "A", "2": "B", "3": "C", "4": "D"}	65	100	65	f	1585	2025-08-18 17:52:24.768	2025-08-19 14:50:00.481
cf932a41-8e66-4a86-9e4e-2f811ec0a0c6	a8851556-7c41-45b4-906b-d4db56f0dae2	3be4b268-1bee-460d-9d71-342e29fb7a20	{"1": "A", "2": "B", "3": "C", "4": "D"}	94	100	94	t	1214	2025-08-18 22:56:24.21	2025-08-19 14:50:00.481
83680c6c-b172-43c3-8f2a-16f9fa534683	b6eacc9f-ddea-41b7-acae-42e45201fae1	3d09b32e-c3ce-4eea-9815-4d1cac0713d3	{"1": "A", "2": "B", "3": "C", "4": "D"}	88	100	88	t	1207	2025-08-18 18:06:00.969	2025-08-19 14:50:00.481
55b43527-c69c-4f1c-9093-f14ff4c8bd9d	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	d28730ee-99b2-4e66-9586-0a733d846b7d	{"1": "A", "2": "B", "3": "C", "4": "D"}	98	100	98	t	1650	2025-08-18 19:58:49.89	2025-08-19 14:50:00.481
2cb8088d-0892-4d0d-aa71-8f305f495db1	ba840c09-cce3-4f79-bf56-e8f5d119b651	cf5c1acc-20c4-4791-9376-d0035346b304	{"1": "A", "2": "B", "3": "C", "4": "D"}	66	100	66	f	1217	2025-08-19 05:29:53.907	2025-08-19 14:50:00.481
dbd5d9b5-5da8-4279-9fef-178d8b98c621	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	9e956b4d-55ff-46ea-8ed5-389147571b4b	{"1": "A", "2": "B", "3": "C", "4": "D"}	83	100	83	t	1069	2025-08-19 06:06:48.392	2025-08-19 14:50:00.481
9c84e7fe-7687-4533-b1bd-632dd34bb5fa	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	d29003d6-a786-4760-9d7c-07d29c175389	{"1": "A", "2": "B", "3": "C", "4": "D"}	70	100	70	t	1205	2025-08-19 13:29:34.547	2025-08-19 14:50:00.481
2c442917-334b-4e1e-92e2-0cdae3ab068c	ea36b494-642c-4de1-b805-bee4428f1971	095fd594-2397-46d0-bad8-cf3edce9fd1d	{"1": "A", "2": "B", "3": "C", "4": "D"}	97	100	97	t	936	2025-08-19 11:14:07.409	2025-08-19 14:50:00.481
d8b26858-67ba-4a75-8cd2-ed3cb8fb2447	faea2f17-071c-4b09-8d66-47aa7f1c96b5	d28730ee-99b2-4e66-9586-0a733d846b7d	{"1": "A", "2": "B", "3": "C", "4": "D"}	65	100	65	f	943	2025-08-18 16:31:26.878	2025-08-19 14:50:00.481
4cf3a1c8-1d17-4882-8645-dbc99436b2b4	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	d29003d6-a786-4760-9d7c-07d29c175389	{"1": "A", "2": "B", "3": "C", "4": "D"}	62	100	62	f	615	2025-08-19 03:39:18.865	2025-08-19 14:50:00.481
749862f9-a5ec-4f1b-bdda-303613583085	393361ca-ff50-43a1-81f9-c4093262fc19	3d09b32e-c3ce-4eea-9815-4d1cac0713d3	{"1": "A", "2": "B", "3": "C", "4": "D"}	76	100	76	t	817	2025-08-19 08:19:49.963	2025-08-19 14:50:00.481
3d160d3a-d158-412d-9032-7b92d59ab71a	750ad13a-23c8-4f90-98f1-a3af8c91b43c	3d09b32e-c3ce-4eea-9815-4d1cac0713d3	{"1": "A", "2": "B", "3": "C", "4": "D"}	81	100	81	t	1363	2025-08-19 12:16:43.017	2025-08-19 14:50:00.481
04b258f9-7f05-40e5-9a98-fd81b5947af3	393361ca-ff50-43a1-81f9-c4093262fc19	8f622a74-2a70-42f3-8a90-f9ab06738eb4	{"1": "A", "2": "B", "3": "C", "4": "D"}	89	100	89	t	1546	2025-08-19 08:26:21.822	2025-08-19 14:50:00.481
04158805-50b6-4224-9963-48c0a6d2e394	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	f6270ed1-38b2-4109-a0b3-289926f4a543	{"1": "A", "2": "B", "3": "C", "4": "D"}	90	100	90	t	802	2025-08-19 01:51:07.604	2025-08-19 14:50:00.481
\.


--
-- TOC entry 3673 (class 0 OID 25011)
-- Dependencies: 223
-- Data for Name: quiz_questions; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.quiz_questions (id, "quizId", question, options, "correctAnswer", explanation, "order", points, "createdAt", "updatedAt") FROM stdin;
36c6a14e-5400-4652-bee4-23b7f54b2e2f	f6270ed1-38b2-4109-a0b3-289926f4a543	Apa yang dimaksud dengan persamaan linear?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Persamaan Linear mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.371561	2025-08-19 21:49:59.371561
d2450eef-7247-4638-8f0c-5530467364b6	f6270ed1-38b2-4109-a0b3-289926f4a543	Manakah yang merupakan ciri-ciri persamaan linear?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari persamaan linear.	2	25	2025-08-19 21:49:59.371561	2025-08-19 21:49:59.371561
58fbd7e6-009f-4a0e-8c24-a8d5cd18b07a	f6270ed1-38b2-4109-a0b3-289926f4a543	Bagaimana cara menyelesaikan soal persamaan linear?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai persamaan linear, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.371561	2025-08-19 21:49:59.371561
6c4f4ae4-98c8-4d0c-9a4d-f12c31f0b41d	f6270ed1-38b2-4109-a0b3-289926f4a543	Apa aplikasi persamaan linear dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Persamaan Linear memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.371561	2025-08-19 21:49:59.371561
1768b4c4-f556-4cae-9d96-fed7b9a9f3d2	d28730ee-99b2-4e66-9586-0a733d846b7d	Apa yang dimaksud dengan persamaan kuadrat?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Persamaan Kuadrat mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.393283	2025-08-19 21:49:59.393283
bcd1242f-a939-4247-85e6-76e612498f7f	d28730ee-99b2-4e66-9586-0a733d846b7d	Manakah yang merupakan ciri-ciri persamaan kuadrat?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari persamaan kuadrat.	2	25	2025-08-19 21:49:59.393283	2025-08-19 21:49:59.393283
d7c7a5f3-d6a8-4deb-8ab8-3ee7217bcc1c	d28730ee-99b2-4e66-9586-0a733d846b7d	Bagaimana cara menyelesaikan soal persamaan kuadrat?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai persamaan kuadrat, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.393283	2025-08-19 21:49:59.393283
675fe695-f0f6-476c-add3-4b34478086da	d28730ee-99b2-4e66-9586-0a733d846b7d	Apa aplikasi persamaan kuadrat dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Persamaan Kuadrat memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.393283	2025-08-19 21:49:59.393283
36cde66f-6896-4db3-a7fa-2cf571fd3f8a	095fd594-2397-46d0-bad8-cf3edce9fd1d	Apa yang dimaksud dengan pertidaksamaan?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Pertidaksamaan mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.410168	2025-08-19 21:49:59.410168
fca96325-08c3-4077-a197-1916bd90aa83	095fd594-2397-46d0-bad8-cf3edce9fd1d	Manakah yang merupakan ciri-ciri pertidaksamaan?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari pertidaksamaan.	2	25	2025-08-19 21:49:59.410168	2025-08-19 21:49:59.410168
d409c18e-9ec9-46d9-81ad-a7d33a1bb4a4	095fd594-2397-46d0-bad8-cf3edce9fd1d	Bagaimana cara menyelesaikan soal pertidaksamaan?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai pertidaksamaan, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.410168	2025-08-19 21:49:59.410168
4b724903-e4be-4922-b7ab-e527dffc4068	095fd594-2397-46d0-bad8-cf3edce9fd1d	Apa aplikasi pertidaksamaan dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Pertidaksamaan memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.410168	2025-08-19 21:49:59.410168
0d82611a-d0b4-49a4-b01b-5d1431cc29b0	8e981771-c826-43f9-9b3c-932766ce3199	Apa yang dimaksud dengan bangun datar?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Bangun Datar mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.431202	2025-08-19 21:49:59.431202
b0958537-19f5-401a-b4ec-ab17918cfdf0	8e981771-c826-43f9-9b3c-932766ce3199	Manakah yang merupakan ciri-ciri bangun datar?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari bangun datar.	2	25	2025-08-19 21:49:59.431202	2025-08-19 21:49:59.431202
c67a64a1-7480-40f3-b86d-2c8c70bb6854	8e981771-c826-43f9-9b3c-932766ce3199	Bagaimana cara menyelesaikan soal bangun datar?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai bangun datar, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.431202	2025-08-19 21:49:59.431202
13869f52-3e52-457f-9074-7be34d166cb9	8e981771-c826-43f9-9b3c-932766ce3199	Apa aplikasi bangun datar dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Bangun Datar memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.431202	2025-08-19 21:49:59.431202
e47dd0b6-69bc-4b9b-9d61-9879150a3834	c2bb6f4f-76ac-47be-8e8c-ccc3fd269e40	Apa yang dimaksud dengan bangun ruang?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Bangun Ruang mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.446859	2025-08-19 21:49:59.446859
e3d28153-7822-4169-ac21-37d447fc13a7	c2bb6f4f-76ac-47be-8e8c-ccc3fd269e40	Manakah yang merupakan ciri-ciri bangun ruang?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari bangun ruang.	2	25	2025-08-19 21:49:59.446859	2025-08-19 21:49:59.446859
ec90bc9d-2232-4999-bc3d-845814d91944	c2bb6f4f-76ac-47be-8e8c-ccc3fd269e40	Bagaimana cara menyelesaikan soal bangun ruang?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai bangun ruang, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.446859	2025-08-19 21:49:59.446859
966c575f-fcec-4bdd-a710-f73716307d04	c2bb6f4f-76ac-47be-8e8c-ccc3fd269e40	Apa aplikasi bangun ruang dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Bangun Ruang memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.446859	2025-08-19 21:49:59.446859
d5922361-b40a-4ec2-9aa4-b8c6257e2bbc	d29003d6-a786-4760-9d7c-07d29c175389	Apa yang dimaksud dengan teorema pythagoras?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Teorema Pythagoras mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.463204	2025-08-19 21:49:59.463204
3b85c1d5-4174-43de-855a-612f715963cb	d29003d6-a786-4760-9d7c-07d29c175389	Manakah yang merupakan ciri-ciri teorema pythagoras?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari teorema pythagoras.	2	25	2025-08-19 21:49:59.463204	2025-08-19 21:49:59.463204
5dc45182-2f06-444d-b435-58baed18022f	d29003d6-a786-4760-9d7c-07d29c175389	Bagaimana cara menyelesaikan soal teorema pythagoras?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai teorema pythagoras, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.463204	2025-08-19 21:49:59.463204
7e3783e2-516d-45b1-948e-767f9251ba44	d29003d6-a786-4760-9d7c-07d29c175389	Apa aplikasi teorema pythagoras dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Teorema Pythagoras memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.463204	2025-08-19 21:49:59.463204
7593a407-d202-4638-8769-8ba1db081ae8	8f622a74-2a70-42f3-8a90-f9ab06738eb4	Apa yang dimaksud dengan fungsi trigonometri?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Fungsi Trigonometri mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.480483	2025-08-19 21:49:59.480483
b1baffe6-5087-4979-bad5-2aa1fe57be3f	8f622a74-2a70-42f3-8a90-f9ab06738eb4	Manakah yang merupakan ciri-ciri fungsi trigonometri?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari fungsi trigonometri.	2	25	2025-08-19 21:49:59.480483	2025-08-19 21:49:59.480483
0b4fa62c-bb93-4ec7-a112-2bd0a290c2ec	8f622a74-2a70-42f3-8a90-f9ab06738eb4	Bagaimana cara menyelesaikan soal fungsi trigonometri?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai fungsi trigonometri, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.480483	2025-08-19 21:49:59.480483
4c55ad09-789c-4171-b3d4-aef5c2cbc436	8f622a74-2a70-42f3-8a90-f9ab06738eb4	Apa aplikasi fungsi trigonometri dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Fungsi Trigonometri memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.480483	2025-08-19 21:49:59.480483
59bbaaa7-22f8-4761-8d61-7bbbc88e00f8	cf5c1acc-20c4-4791-9376-d0035346b304	Apa yang dimaksud dengan identitas trigonometri?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Identitas Trigonometri mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.496488	2025-08-19 21:49:59.496488
b6f96c17-a9a4-4999-b96f-70615ffbe235	cf5c1acc-20c4-4791-9376-d0035346b304	Manakah yang merupakan ciri-ciri identitas trigonometri?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari identitas trigonometri.	2	25	2025-08-19 21:49:59.496488	2025-08-19 21:49:59.496488
e6be453c-8370-4f43-80a0-3482f142c360	cf5c1acc-20c4-4791-9376-d0035346b304	Bagaimana cara menyelesaikan soal identitas trigonometri?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai identitas trigonometri, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.496488	2025-08-19 21:49:59.496488
c058fbec-fc93-47c6-ab84-0a02e2bbb341	cf5c1acc-20c4-4791-9376-d0035346b304	Apa aplikasi identitas trigonometri dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Identitas Trigonometri memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.496488	2025-08-19 21:49:59.496488
99f5bb1a-6322-4c86-b4f1-03a7f15d01ba	46d33bb3-0514-489c-b738-62e25b671b54	Apa yang dimaksud dengan aplikasi trigonometri?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Aplikasi Trigonometri mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.512268	2025-08-19 21:49:59.512268
93c45c82-7cfa-44ef-a783-daddd4e97b79	46d33bb3-0514-489c-b738-62e25b671b54	Manakah yang merupakan ciri-ciri aplikasi trigonometri?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari aplikasi trigonometri.	2	25	2025-08-19 21:49:59.512268	2025-08-19 21:49:59.512268
d63044e4-2549-41ce-aa86-b3441db67860	46d33bb3-0514-489c-b738-62e25b671b54	Bagaimana cara menyelesaikan soal aplikasi trigonometri?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai aplikasi trigonometri, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.512268	2025-08-19 21:49:59.512268
5204cf52-a35d-4967-a928-52e994b92de3	46d33bb3-0514-489c-b738-62e25b671b54	Apa aplikasi aplikasi trigonometri dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Aplikasi Trigonometri memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.512268	2025-08-19 21:49:59.512268
62de3203-6aaa-46c9-b523-e119734c421a	e6c5369e-3bb0-49f7-affe-51ef9b6d73c6	Apa yang dimaksud dengan gerak lurus?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Gerak Lurus mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.52991	2025-08-19 21:49:59.52991
3a5ea52a-fff4-429e-891f-67a5dc1bf14d	e6c5369e-3bb0-49f7-affe-51ef9b6d73c6	Manakah yang merupakan ciri-ciri gerak lurus?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari gerak lurus.	2	25	2025-08-19 21:49:59.52991	2025-08-19 21:49:59.52991
9d166159-8b59-4f3c-8217-136a24de1910	e6c5369e-3bb0-49f7-affe-51ef9b6d73c6	Bagaimana cara menyelesaikan soal gerak lurus?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai gerak lurus, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.52991	2025-08-19 21:49:59.52991
b702354b-f9c4-4bd2-8e6d-7a7c40cc1c77	e6c5369e-3bb0-49f7-affe-51ef9b6d73c6	Apa aplikasi gerak lurus dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Gerak Lurus memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.52991	2025-08-19 21:49:59.52991
5abdfa87-fcdc-4984-8215-cb9d18ae5446	9e956b4d-55ff-46ea-8ed5-389147571b4b	Apa yang dimaksud dengan hukum newton?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Hukum Newton mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.546983	2025-08-19 21:49:59.546983
a8341cae-6fdc-4362-a7be-0c679be2595c	9e956b4d-55ff-46ea-8ed5-389147571b4b	Manakah yang merupakan ciri-ciri hukum newton?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari hukum newton.	2	25	2025-08-19 21:49:59.546983	2025-08-19 21:49:59.546983
69f2e8a3-61b9-42a6-81a0-6f85d6c82af6	9e956b4d-55ff-46ea-8ed5-389147571b4b	Bagaimana cara menyelesaikan soal hukum newton?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai hukum newton, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.546983	2025-08-19 21:49:59.546983
08df5a41-d703-460a-8091-e04b5f6d936e	9e956b4d-55ff-46ea-8ed5-389147571b4b	Apa aplikasi hukum newton dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Hukum Newton memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.546983	2025-08-19 21:49:59.546983
9aa931a2-e3ac-4fc3-85f6-33f288ef73f0	e031ba3d-48b3-4397-99f5-d9387fb36fa0	Apa yang dimaksud dengan dinamika rotasi?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Dinamika Rotasi mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.561634	2025-08-19 21:49:59.561634
f1cfd6ba-83dd-4494-b688-81f505a5f7c9	e031ba3d-48b3-4397-99f5-d9387fb36fa0	Manakah yang merupakan ciri-ciri dinamika rotasi?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari dinamika rotasi.	2	25	2025-08-19 21:49:59.561634	2025-08-19 21:49:59.561634
43c0a9ef-ba88-4e26-a0e2-f80663cf7f45	e031ba3d-48b3-4397-99f5-d9387fb36fa0	Bagaimana cara menyelesaikan soal dinamika rotasi?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai dinamika rotasi, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.561634	2025-08-19 21:49:59.561634
8218d536-7f16-468c-823a-b53ccba6943c	e031ba3d-48b3-4397-99f5-d9387fb36fa0	Apa aplikasi dinamika rotasi dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Dinamika Rotasi memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.561634	2025-08-19 21:49:59.561634
e9aaed2e-9447-441e-8627-c213f906418b	42c57716-935e-4dd6-a8df-67fbe00f043b	Apa yang dimaksud dengan suhu dan kalor?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Suhu dan Kalor mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.57795	2025-08-19 21:49:59.57795
d14d02d5-035a-436c-9b44-33fc9ff7545f	42c57716-935e-4dd6-a8df-67fbe00f043b	Manakah yang merupakan ciri-ciri suhu dan kalor?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari suhu dan kalor.	2	25	2025-08-19 21:49:59.57795	2025-08-19 21:49:59.57795
2d9d364c-97a1-4564-83d8-29909dabf08e	42c57716-935e-4dd6-a8df-67fbe00f043b	Bagaimana cara menyelesaikan soal suhu dan kalor?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai suhu dan kalor, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.57795	2025-08-19 21:49:59.57795
7db711ea-885f-4645-8ea2-ca321bb1ab10	42c57716-935e-4dd6-a8df-67fbe00f043b	Apa aplikasi suhu dan kalor dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Suhu dan Kalor memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.57795	2025-08-19 21:49:59.57795
7dc8bdba-1a43-4d32-b63c-0a1d6f55d8ac	3be4b268-1bee-460d-9d71-342e29fb7a20	Apa yang dimaksud dengan hukum termodinamika i?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Hukum Termodinamika I mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.593701	2025-08-19 21:49:59.593701
e670972c-8642-46b3-a627-7ac04619a8a4	3be4b268-1bee-460d-9d71-342e29fb7a20	Manakah yang merupakan ciri-ciri hukum termodinamika i?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari hukum termodinamika i.	2	25	2025-08-19 21:49:59.593701	2025-08-19 21:49:59.593701
d842aea7-c60d-4c7c-9ad3-c44bb5c57bac	3be4b268-1bee-460d-9d71-342e29fb7a20	Bagaimana cara menyelesaikan soal hukum termodinamika i?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai hukum termodinamika i, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.593701	2025-08-19 21:49:59.593701
a662460b-62c0-432d-9249-463ad7434c8e	3be4b268-1bee-460d-9d71-342e29fb7a20	Apa aplikasi hukum termodinamika i dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Hukum Termodinamika I memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.593701	2025-08-19 21:49:59.593701
8c7f01e2-8bf9-4a9d-bb23-e43a4f457fc0	3d09b32e-c3ce-4eea-9815-4d1cac0713d3	Apa yang dimaksud dengan hukum termodinamika ii?	["A. Konsep dasar", "B. Rumus matematika", "C. Teori fisika", "D. Semua benar"]	D	Hukum Termodinamika II mencakup berbagai aspek pembelajaran yang penting.	1	25	2025-08-19 21:49:59.609192	2025-08-19 21:49:59.609192
8af3a752-bfd8-4394-8eae-ee3a389623fe	3d09b32e-c3ce-4eea-9815-4d1cac0713d3	Manakah yang merupakan ciri-ciri hukum termodinamika ii?	["A. Mudah dipahami", "B. Memiliki rumus khusus", "C. Dapat diaplikasikan", "D. Semua benar"]	D	Semua pilihan merupakan ciri-ciri dari hukum termodinamika ii.	2	25	2025-08-19 21:49:59.609192	2025-08-19 21:49:59.609192
0b7f6189-685a-434c-8a43-6f00edfe5297	3d09b32e-c3ce-4eea-9815-4d1cac0713d3	Bagaimana cara menyelesaikan soal hukum termodinamika ii?	["A. Menggunakan rumus", "B. Memahami konsep", "C. Berlatih soal", "D. Semua benar"]	D	Untuk menguasai hukum termodinamika ii, diperlukan pemahaman konsep, rumus, dan latihan.	3	25	2025-08-19 21:49:59.609192	2025-08-19 21:49:59.609192
a4f22042-cf88-4918-bdb6-b2a6e28a7477	3d09b32e-c3ce-4eea-9815-4d1cac0713d3	Apa aplikasi hukum termodinamika ii dalam kehidupan sehari-hari?	["A. Perhitungan", "B. Analisis", "C. Pemecahan masalah", "D. Semua benar"]	D	Hukum Termodinamika II memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.	4	25	2025-08-19 21:49:59.609192	2025-08-19 21:49:59.609192
\.


--
-- TOC entry 3674 (class 0 OID 25023)
-- Dependencies: 224
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.quizzes (id, "subchapterId", title, description, "isActive", "timeLimit", "passingScore", "createdAt", "updatedAt") FROM stdin;
f6270ed1-38b2-4109-a0b3-289926f4a543	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Quiz: Persamaan Linear	Quiz untuk menguji pemahaman tentang persamaan linear	t	30	70	2025-08-19 21:49:59.360593	2025-08-19 21:49:59.360593
d28730ee-99b2-4e66-9586-0a733d846b7d	557aa861-5434-4983-8caa-62b6512880f1	Quiz: Persamaan Kuadrat	Quiz untuk menguji pemahaman tentang persamaan kuadrat	t	30	70	2025-08-19 21:49:59.383517	2025-08-19 21:49:59.383517
095fd594-2397-46d0-bad8-cf3edce9fd1d	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Quiz: Pertidaksamaan	Quiz untuk menguji pemahaman tentang pertidaksamaan	t	30	70	2025-08-19 21:49:59.40133	2025-08-19 21:49:59.40133
8e981771-c826-43f9-9b3c-932766ce3199	c0854731-59ec-4a91-b357-2a2571a7c0d0	Quiz: Bangun Datar	Quiz untuk menguji pemahaman tentang bangun datar	t	30	70	2025-08-19 21:49:59.422336	2025-08-19 21:49:59.422336
c2bb6f4f-76ac-47be-8e8c-ccc3fd269e40	6b3395b5-2a30-4dbd-9f94-04e2af015118	Quiz: Bangun Ruang	Quiz untuk menguji pemahaman tentang bangun ruang	t	30	70	2025-08-19 21:49:59.439243	2025-08-19 21:49:59.439243
d29003d6-a786-4760-9d7c-07d29c175389	88028e3f-58fb-49e5-84d8-5fc328330f80	Quiz: Teorema Pythagoras	Quiz untuk menguji pemahaman tentang teorema pythagoras	t	30	70	2025-08-19 21:49:59.454347	2025-08-19 21:49:59.454347
8f622a74-2a70-42f3-8a90-f9ab06738eb4	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	Quiz: Fungsi Trigonometri	Quiz untuk menguji pemahaman tentang fungsi trigonometri	t	30	70	2025-08-19 21:49:59.47394	2025-08-19 21:49:59.47394
cf5c1acc-20c4-4791-9376-d0035346b304	e703675f-c6b0-4000-a9df-56758e33236b	Quiz: Identitas Trigonometri	Quiz untuk menguji pemahaman tentang identitas trigonometri	t	30	70	2025-08-19 21:49:59.488502	2025-08-19 21:49:59.488502
46d33bb3-0514-489c-b738-62e25b671b54	b380e8dc-9a61-481b-8ab0-6a63758810b6	Quiz: Aplikasi Trigonometri	Quiz untuk menguji pemahaman tentang aplikasi trigonometri	t	30	70	2025-08-19 21:49:59.50331	2025-08-19 21:49:59.50331
e6c5369e-3bb0-49f7-affe-51ef9b6d73c6	dc8f1873-59c1-46d0-8479-478040fb2e2d	Quiz: Gerak Lurus	Quiz untuk menguji pemahaman tentang gerak lurus	t	30	70	2025-08-19 21:49:59.522867	2025-08-19 21:49:59.522867
9e956b4d-55ff-46ea-8ed5-389147571b4b	b9e7583b-0630-4f90-8325-1468b07d5093	Quiz: Hukum Newton	Quiz untuk menguji pemahaman tentang hukum newton	t	30	70	2025-08-19 21:49:59.538644	2025-08-19 21:49:59.538644
e031ba3d-48b3-4397-99f5-d9387fb36fa0	87221a36-013e-4779-aa0a-a1f53e2833e2	Quiz: Dinamika Rotasi	Quiz untuk menguji pemahaman tentang dinamika rotasi	t	30	70	2025-08-19 21:49:59.554655	2025-08-19 21:49:59.554655
42c57716-935e-4dd6-a8df-67fbe00f043b	73ca3123-b63e-4ef2-b471-abfd44e75146	Quiz: Suhu dan Kalor	Quiz untuk menguji pemahaman tentang suhu dan kalor	t	30	70	2025-08-19 21:49:59.568815	2025-08-19 21:49:59.568815
3be4b268-1bee-460d-9d71-342e29fb7a20	5abb441e-528c-46a4-9bbb-8f3918ea856b	Quiz: Hukum Termodinamika I	Quiz untuk menguji pemahaman tentang hukum termodinamika i	t	30	70	2025-08-19 21:49:59.585251	2025-08-19 21:49:59.585251
3d09b32e-c3ce-4eea-9815-4d1cac0713d3	29201e8e-d278-4963-a5a5-b0b832f91d76	Quiz: Hukum Termodinamika II	Quiz untuk menguji pemahaman tentang hukum termodinamika ii	t	30	70	2025-08-19 21:49:59.602627	2025-08-19 21:49:59.602627
\.


--
-- TOC entry 3675 (class 0 OID 25037)
-- Dependencies: 225
-- Data for Name: subchapter_materials; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.subchapter_materials (id, "subchapterId", title, description, "fileName", "fileUrl", "fileType", "fileSize", "mimeType", "thumbnailUrl", duration, "uploadedBy", "isActive", "createdAt", "updatedAt") FROM stdin;
dda3b94e-aad6-46ce-833e-6eb8186d055c	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Materi Persamaan Linear	Materi pembelajaran untuk Persamaan Linear	persamaan_linear.docx	/uploads/documents/persamaan_linear.docx	document	2573121	application/vnd.openxmlformats-officedocument.wordprocessingml.document	\N	\N	6f6a2ca0-bd0e-48da-9a0b-b68e1853cf0d	t	2025-08-19 21:50:01.293342	2025-08-19 21:50:01.293342
b3a8e68a-9464-4114-8948-4792ceeee3b7	557aa861-5434-4983-8caa-62b6512880f1	Materi Persamaan Kuadrat	Materi pembelajaran untuk Persamaan Kuadrat	persamaan_kuadrat.pdf	/uploads/pdfs/persamaan_kuadrat.pdf	pdf	8379579	application/pdf	\N	\N	6f6a2ca0-bd0e-48da-9a0b-b68e1853cf0d	t	2025-08-19 21:50:01.303816	2025-08-19 21:50:01.303816
3e31a277-f636-4dee-a1a1-73db269a8860	373f873b-1a83-4d7f-9dec-5aa36b7daadc	Materi Pertidaksamaan	Materi pembelajaran untuk Pertidaksamaan	pertidaksamaan.mp4	/uploads/videos/pertidaksamaan.mp4	video	8207458	video/mp4	/uploads/thumbnails/pertidaksamaan_thumb.jpg	2285	6f6a2ca0-bd0e-48da-9a0b-b68e1853cf0d	t	2025-08-19 21:50:01.3118	2025-08-19 21:50:01.3118
1df16d8b-91dd-453e-9058-a8dcfdc116e6	c0854731-59ec-4a91-b357-2a2571a7c0d0	Materi Bangun Datar	Materi pembelajaran untuk Bangun Datar	bangun_datar.jpg	/uploads/images/bangun_datar.jpg	image	3040062	image/jpeg	\N	\N	6f6a2ca0-bd0e-48da-9a0b-b68e1853cf0d	t	2025-08-19 21:50:01.320925	2025-08-19 21:50:01.320925
fb3038f1-1b72-4be7-a49c-31a46f44fcf9	6b3395b5-2a30-4dbd-9f94-04e2af015118	Materi Bangun Ruang	Materi pembelajaran untuk Bangun Ruang	bangun_ruang.pdf	/uploads/pdfs/bangun_ruang.pdf	pdf	5156595	application/pdf	\N	\N	f5fe8b63-0fb3-45af-8550-9da36fc701f0	t	2025-08-19 21:50:01.326844	2025-08-19 21:50:01.326844
a07f5af7-c78c-4800-90ac-56751e1a2110	88028e3f-58fb-49e5-84d8-5fc328330f80	Materi Teorema Pythagoras	Materi pembelajaran untuk Teorema Pythagoras	teorema_pythagoras.mp4	/uploads/videos/teorema_pythagoras.mp4	video	7164307	video/mp4	/uploads/thumbnails/teorema_pythagoras_thumb.jpg	1312	e0af000d-5904-4f51-b68a-64679877c2ee	t	2025-08-19 21:50:01.334819	2025-08-19 21:50:01.334819
1bdc595f-2f11-4fe9-9c82-044ce096ab1d	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	Materi Fungsi Trigonometri	Materi pembelajaran untuk Fungsi Trigonometri	fungsi_trigonometri.docx	/uploads/documents/fungsi_trigonometri.docx	document	5809265	application/vnd.openxmlformats-officedocument.wordprocessingml.document	\N	\N	e0af000d-5904-4f51-b68a-64679877c2ee	t	2025-08-19 21:50:01.342692	2025-08-19 21:50:01.342692
017aa45e-084b-4159-8a98-57fc73fea2c9	e703675f-c6b0-4000-a9df-56758e33236b	Materi Identitas Trigonometri	Materi pembelajaran untuk Identitas Trigonometri	identitas_trigonometri.jpg	/uploads/images/identitas_trigonometri.jpg	image	4677720	image/jpeg	\N	\N	e0af000d-5904-4f51-b68a-64679877c2ee	t	2025-08-19 21:50:01.348866	2025-08-19 21:50:01.348866
ccd6a3fa-0c70-47f2-98f7-08f6c31c057f	b380e8dc-9a61-481b-8ab0-6a63758810b6	Materi Aplikasi Trigonometri	Materi pembelajaran untuk Aplikasi Trigonometri	aplikasi_trigonometri.docx	/uploads/documents/aplikasi_trigonometri.docx	document	1141265	application/vnd.openxmlformats-officedocument.wordprocessingml.document	\N	\N	e0af000d-5904-4f51-b68a-64679877c2ee	t	2025-08-19 21:50:01.35564	2025-08-19 21:50:01.35564
a14b1845-e9cf-43e6-8741-6d1c64a75cc1	dc8f1873-59c1-46d0-8479-478040fb2e2d	Materi Gerak Lurus	Materi pembelajaran untuk Gerak Lurus	gerak_lurus.pdf	/uploads/pdfs/gerak_lurus.pdf	pdf	2980387	application/pdf	\N	\N	f5fe8b63-0fb3-45af-8550-9da36fc701f0	t	2025-08-19 21:50:01.364625	2025-08-19 21:50:01.364625
26174ea3-7ba2-445d-af5b-793525c429cf	b9e7583b-0630-4f90-8325-1468b07d5093	Materi Hukum Newton	Materi pembelajaran untuk Hukum Newton	hukum_newton.pdf	/uploads/pdfs/hukum_newton.pdf	pdf	4184498	application/pdf	\N	\N	f5fe8b63-0fb3-45af-8550-9da36fc701f0	t	2025-08-19 21:50:01.370474	2025-08-19 21:50:01.370474
731d96ce-cfe9-42d9-87b9-f9f3161ee27c	87221a36-013e-4779-aa0a-a1f53e2833e2	Materi Dinamika Rotasi	Materi pembelajaran untuk Dinamika Rotasi	dinamika_rotasi.mp4	/uploads/videos/dinamika_rotasi.mp4	video	3015445	video/mp4	/uploads/thumbnails/dinamika_rotasi_thumb.jpg	1735	f5fe8b63-0fb3-45af-8550-9da36fc701f0	t	2025-08-19 21:50:01.376226	2025-08-19 21:50:01.376226
8cd890d4-008e-4b05-8a69-b68fccaf4d1c	73ca3123-b63e-4ef2-b471-abfd44e75146	Materi Suhu dan Kalor	Materi pembelajaran untuk Suhu dan Kalor	suhu_dan_kalor.jpg	/uploads/images/suhu_dan_kalor.jpg	image	8448668	image/jpeg	\N	\N	f5fe8b63-0fb3-45af-8550-9da36fc701f0	t	2025-08-19 21:50:01.382424	2025-08-19 21:50:01.382424
d615cfcd-5cbe-461a-bb25-cd77d4bcaebe	5abb441e-528c-46a4-9bbb-8f3918ea856b	Materi Hukum Termodinamika I	Materi pembelajaran untuk Hukum Termodinamika I	hukum_termodinamika_i.pdf	/uploads/pdfs/hukum_termodinamika_i.pdf	pdf	9400226	application/pdf	\N	\N	f5fe8b63-0fb3-45af-8550-9da36fc701f0	t	2025-08-19 21:50:01.387476	2025-08-19 21:50:01.387476
fcff480c-ac7e-446e-8c44-c28bd47cc583	29201e8e-d278-4963-a5a5-b0b832f91d76	Materi Hukum Termodinamika II	Materi pembelajaran untuk Hukum Termodinamika II	hukum_termodinamika_ii.docx	/uploads/documents/hukum_termodinamika_ii.docx	document	9809785	application/vnd.openxmlformats-officedocument.wordprocessingml.document	\N	\N	6f6a2ca0-bd0e-48da-9a0b-b68e1853cf0d	t	2025-08-19 21:50:01.392446	2025-08-19 21:50:01.392446
2e976877-8edd-49d1-8c67-d84690485c69	730f8090-510c-4eb3-8b68-53b5c4eaa744	Materi Gelombang Mekanik	Materi pembelajaran untuk Gelombang Mekanik	gelombang_mekanik.mp4	/uploads/videos/gelombang_mekanik.mp4	video	2277718	video/mp4	/uploads/thumbnails/gelombang_mekanik_thumb.jpg	2778	e0af000d-5904-4f51-b68a-64679877c2ee	t	2025-08-19 21:50:01.397792	2025-08-19 21:50:01.397792
316e03d3-6a1a-4e8b-a236-86941ca44be2	6386ae77-b850-49d7-8f89-fc610022bdd7	Materi Gelombang Elektromagnetik	Materi pembelajaran untuk Gelombang Elektromagnetik	gelombang_elektromagnetik.mp4	/uploads/videos/gelombang_elektromagnetik.mp4	video	8095231	video/mp4	/uploads/thumbnails/gelombang_elektromagnetik_thumb.jpg	2634	e0af000d-5904-4f51-b68a-64679877c2ee	t	2025-08-19 21:50:01.402985	2025-08-19 21:50:01.402985
1eafe276-4acf-4d59-a246-01646b92d370	08706a0a-dd55-4689-8e0b-10c08e8c154f	Materi Interferensi dan Difraksi	Materi pembelajaran untuk Interferensi dan Difraksi	interferensi_dan_difraksi.docx	/uploads/documents/interferensi_dan_difraksi.docx	document	8804876	application/vnd.openxmlformats-officedocument.wordprocessingml.document	\N	\N	6f6a2ca0-bd0e-48da-9a0b-b68e1853cf0d	t	2025-08-19 21:50:01.408004	2025-08-19 21:50:01.408004
ab88df28-d5a7-418d-b67e-7f4143ff5b6f	df930345-d610-4a73-9383-e466b3ccaaaf	Materi Model Atom	Materi pembelajaran untuk Model Atom	model_atom.mp4	/uploads/videos/model_atom.mp4	video	4608354	video/mp4	/uploads/thumbnails/model_atom_thumb.jpg	2986	6f6a2ca0-bd0e-48da-9a0b-b68e1853cf0d	t	2025-08-19 21:50:01.414775	2025-08-19 21:50:01.414775
7ff3ec6e-5290-4589-b673-911753a8c7b7	b4ce5a8d-0ab2-41a8-8c12-9e7578a4c268	Materi Konfigurasi Elektron	Materi pembelajaran untuk Konfigurasi Elektron	konfigurasi_elektron.mp4	/uploads/videos/konfigurasi_elektron.mp4	video	1962522	video/mp4	/uploads/thumbnails/konfigurasi_elektron_thumb.jpg	881	e0af000d-5904-4f51-b68a-64679877c2ee	t	2025-08-19 21:50:01.42217	2025-08-19 21:50:01.42217
\.


--
-- TOC entry 3676 (class 0 OID 25048)
-- Dependencies: 226
-- Data for Name: subchapters; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.subchapters (id, title, description, "order", "chapterId", "isActive", "createdAt", "updatedAt") FROM stdin;
93bd3ffb-9f31-40c0-8aa6-89c74df64d68	Persamaan Linear	Persamaan linear satu variabel dan sistem persamaan linear	1	ada9f006-1de9-456c-b2ff-01861b7518d0	t	2025-08-19 21:49:59.055142	2025-08-19 21:49:59.055142
557aa861-5434-4983-8caa-62b6512880f1	Persamaan Kuadrat	Persamaan kuadrat, diskriminan, dan akar-akar persamaan	2	ada9f006-1de9-456c-b2ff-01861b7518d0	t	2025-08-19 21:49:59.066548	2025-08-19 21:49:59.066548
373f873b-1a83-4d7f-9dec-5aa36b7daadc	Pertidaksamaan	Pertidaksamaan linear dan kuadrat	3	ada9f006-1de9-456c-b2ff-01861b7518d0	t	2025-08-19 21:49:59.072998	2025-08-19 21:49:59.072998
c0854731-59ec-4a91-b357-2a2571a7c0d0	Bangun Datar	Luas dan keliling bangun datar	1	b6cb412e-77f6-4ce7-a86b-051d930a56a3	t	2025-08-19 21:49:59.081219	2025-08-19 21:49:59.081219
6b3395b5-2a30-4dbd-9f94-04e2af015118	Bangun Ruang	Volume dan luas permukaan bangun ruang	2	b6cb412e-77f6-4ce7-a86b-051d930a56a3	t	2025-08-19 21:49:59.091888	2025-08-19 21:49:59.091888
88028e3f-58fb-49e5-84d8-5fc328330f80	Teorema Pythagoras	Teorema Pythagoras dan aplikasinya	3	b6cb412e-77f6-4ce7-a86b-051d930a56a3	t	2025-08-19 21:49:59.098977	2025-08-19 21:49:59.098977
c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	Fungsi Trigonometri	Sin, cos, tan dan fungsi trigonometri lainnya	1	c7a3084e-4189-4c4d-9f5c-010f9d65b02a	t	2025-08-19 21:49:59.108695	2025-08-19 21:49:59.108695
e703675f-c6b0-4000-a9df-56758e33236b	Identitas Trigonometri	Identitas dan rumus trigonometri	2	c7a3084e-4189-4c4d-9f5c-010f9d65b02a	t	2025-08-19 21:49:59.116226	2025-08-19 21:49:59.116226
b380e8dc-9a61-481b-8ab0-6a63758810b6	Aplikasi Trigonometri	Penerapan trigonometri dalam kehidupan	3	c7a3084e-4189-4c4d-9f5c-010f9d65b02a	t	2025-08-19 21:49:59.124655	2025-08-19 21:49:59.124655
dc8f1873-59c1-46d0-8479-478040fb2e2d	Gerak Lurus	Gerak lurus beraturan dan berubah beraturan	1	c8507a26-4ac4-4f47-9a48-96b576f94125	t	2025-08-19 21:49:59.132801	2025-08-19 21:49:59.132801
b9e7583b-0630-4f90-8325-1468b07d5093	Hukum Newton	Hukum I, II, dan III Newton tentang gerak	2	c8507a26-4ac4-4f47-9a48-96b576f94125	t	2025-08-19 21:49:59.139559	2025-08-19 21:49:59.139559
87221a36-013e-4779-aa0a-a1f53e2833e2	Dinamika Rotasi	Gerak rotasi dan momen inersia	3	c8507a26-4ac4-4f47-9a48-96b576f94125	t	2025-08-19 21:49:59.146989	2025-08-19 21:49:59.146989
73ca3123-b63e-4ef2-b471-abfd44e75146	Suhu dan Kalor	Konsep suhu, kalor, dan perpindahan kalor	1	2dd483b9-6f81-48e9-a655-83d1e30236ae	t	2025-08-19 21:49:59.155527	2025-08-19 21:49:59.155527
5abb441e-528c-46a4-9bbb-8f3918ea856b	Hukum Termodinamika I	Hukum kekekalan energi dalam termodinamika	2	2dd483b9-6f81-48e9-a655-83d1e30236ae	t	2025-08-19 21:49:59.162665	2025-08-19 21:49:59.162665
29201e8e-d278-4963-a5a5-b0b832f91d76	Hukum Termodinamika II	Entropi dan efisiensi mesin kalor	3	2dd483b9-6f81-48e9-a655-83d1e30236ae	t	2025-08-19 21:49:59.171267	2025-08-19 21:49:59.171267
730f8090-510c-4eb3-8b68-53b5c4eaa744	Gelombang Mekanik	Gelombang pada tali dan gelombang bunyi	1	5c3ddbfd-662c-4c69-8f64-56eab8736931	t	2025-08-19 21:49:59.178318	2025-08-19 21:49:59.178318
6386ae77-b850-49d7-8f89-fc610022bdd7	Gelombang Elektromagnetik	Spektrum elektromagnetik dan sifatnya	2	5c3ddbfd-662c-4c69-8f64-56eab8736931	t	2025-08-19 21:49:59.185315	2025-08-19 21:49:59.185315
08706a0a-dd55-4689-8e0b-10c08e8c154f	Interferensi dan Difraksi	Fenomena interferensi dan difraksi gelombang	3	5c3ddbfd-662c-4c69-8f64-56eab8736931	t	2025-08-19 21:49:59.192443	2025-08-19 21:49:59.192443
df930345-d610-4a73-9383-e466b3ccaaaf	Model Atom	Perkembangan model atom dari Dalton hingga modern	1	abb0c2cb-438c-4014-95d3-1d83253544dd	t	2025-08-19 21:49:59.200373	2025-08-19 21:49:59.200373
b4ce5a8d-0ab2-41a8-8c12-9e7578a4c268	Konfigurasi Elektron	Susunan elektron dalam atom	2	abb0c2cb-438c-4014-95d3-1d83253544dd	t	2025-08-19 21:49:59.211101	2025-08-19 21:49:59.211101
f9e216aa-6352-4b0c-8f89-c58c31121a79	Tabel Periodik	Sistem periodik unsur dan sifat periodik	3	abb0c2cb-438c-4014-95d3-1d83253544dd	t	2025-08-19 21:49:59.217736	2025-08-19 21:49:59.217736
1d7a315d-303c-45e1-8501-5c5c0e82e75d	Ikatan Ion	Pembentukan dan sifat ikatan ion	1	6542d460-583e-49b6-8750-bbd69f5a6e8b	t	2025-08-19 21:49:59.224966	2025-08-19 21:49:59.224966
584e2465-6a4c-49d7-b507-cc08c1e73b6b	Ikatan Kovalen	Ikatan kovalen tunggal, rangkap, dan koordinasi	2	6542d460-583e-49b6-8750-bbd69f5a6e8b	t	2025-08-19 21:49:59.23188	2025-08-19 21:49:59.23188
15f4c189-4c5a-41a8-afd9-113cb9dfeb8e	Ikatan Logam	Teori elektron bebas dan sifat logam	3	6542d460-583e-49b6-8750-bbd69f5a6e8b	t	2025-08-19 21:49:59.239619	2025-08-19 21:49:59.239619
c788c8aa-9698-492f-872e-8d5bf9d6b18e	Konsep Mol	Pengertian mol dan perhitungan kimia dasar	1	4db0a759-7154-492b-aa06-43d8accf423a	t	2025-08-19 21:49:59.246394	2025-08-19 21:49:59.246394
0de149fa-a186-4534-9f4b-35b9cd5a308d	Persamaan Reaksi	Penyetaraan persamaan reaksi kimia	2	4db0a759-7154-492b-aa06-43d8accf423a	t	2025-08-19 21:49:59.254415	2025-08-19 21:49:59.254415
9098752a-fe04-4795-bf34-cd2314e952af	Perhitungan Kimia	Stoikiometri dalam reaksi kimia	3	4db0a759-7154-492b-aa06-43d8accf423a	t	2025-08-19 21:49:59.261798	2025-08-19 21:49:59.261798
\.


--
-- TOC entry 3677 (class 0 OID 25062)
-- Dependencies: 227
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.subjects (id, title, description, "gradeId", "isActive", "createdAt", "updatedAt") FROM stdin;
d9900b4c-46c5-46f9-acc2-ab2045dbfd71	Matematika	Matematika Kelas 10 - Aljabar, Geometri, Trigonometri	b0f6f766-cbe9-41f1-9330-c72e2318f133	t	2025-08-19 21:49:58.737566	2025-08-19 21:49:58.737566
f4d3c764-9b22-4253-95cb-92a8af51e54b	Fisika	Fisika Kelas 10 - Mekanika, Termodinamika, Gelombang	b0f6f766-cbe9-41f1-9330-c72e2318f133	t	2025-08-19 21:49:58.749287	2025-08-19 21:49:58.749287
a845f9dc-fd0e-4ef3-a2ff-54c175926074	Kimia	Kimia Kelas 10 - Struktur Atom, Ikatan Kimia, Stoikiometri	b0f6f766-cbe9-41f1-9330-c72e2318f133	t	2025-08-19 21:49:58.764148	2025-08-19 21:49:58.764148
bfc278e7-a8c3-4c0c-ab4b-e46c3bc44446	Matematika	Matematika Kelas 11 - Limit, Turunan, Integral	e5ced14e-26df-4bc4-8520-06a7bced571b	t	2025-08-19 21:49:58.77439	2025-08-19 21:49:58.77439
3a2ba62f-8839-4aba-9011-a6dfdec174bb	Fisika	Fisika Kelas 11 - Listrik, Magnet, Optik	e5ced14e-26df-4bc4-8520-06a7bced571b	t	2025-08-19 21:49:58.783031	2025-08-19 21:49:58.783031
b36b2c2c-50af-46df-a75c-bb2c0b300ff7	Kimia	Kimia Kelas 11 - Larutan, Kesetimbangan, Termokimia	e5ced14e-26df-4bc4-8520-06a7bced571b	t	2025-08-19 21:49:58.792393	2025-08-19 21:49:58.792393
fdbfcb7c-e29d-4953-a592-96fff9c565a1	Matematika	Matematika Kelas 12 - Integral Lanjut, Statistika, Peluang	77fcfae4-61a8-4594-a26c-7c8e28e3807e	t	2025-08-19 21:49:58.801499	2025-08-19 21:49:58.801499
ff8d855c-6880-4265-a66d-7b3868b71446	Fisika	Fisika Kelas 12 - Fisika Modern, Relativitas, Kuantum	77fcfae4-61a8-4594-a26c-7c8e28e3807e	t	2025-08-19 21:49:58.809544	2025-08-19 21:49:58.809544
e73f492d-17a4-469b-8d71-03dc7e2e524f	Kimia	Kimia Kelas 12 - Kimia Organik, Polimer, Biokimia	77fcfae4-61a8-4594-a26c-7c8e28e3807e	t	2025-08-19 21:49:58.816882	2025-08-19 21:49:58.816882
\.


--
-- TOC entry 3678 (class 0 OID 25075)
-- Dependencies: 228
-- Data for Name: user_progress; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.user_progress (id, "userId", "subchapterId", status, "completedAt", "createdAt", "updatedAt") FROM stdin;
c243d5f7-5dfd-43b5-aab0-143e7abfc5de	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.620699	2025-08-19 21:49:59.620699
b2c074f9-cd7c-49cd-bbea-82cfed6bf0c9	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	557aa861-5434-4983-8caa-62b6512880f1	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.631194	2025-08-19 21:49:59.631194
6efebe70-b202-47d8-ac04-2514efe7c35c	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	373f873b-1a83-4d7f-9dec-5aa36b7daadc	NOT_STARTED	\N	2025-08-19 21:49:59.639603	2025-08-19 21:49:59.639603
b350f60a-f142-4389-ba11-8eaf185e53b9	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	c0854731-59ec-4a91-b357-2a2571a7c0d0	NOT_STARTED	\N	2025-08-19 21:49:59.64684	2025-08-19 21:49:59.64684
4deb08a7-0a42-4675-8394-c4c5c1a108c3	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	6b3395b5-2a30-4dbd-9f94-04e2af015118	NOT_STARTED	\N	2025-08-19 21:49:59.657297	2025-08-19 21:49:59.657297
0cdec8f1-12f7-431e-9b5a-8a867b8aae28	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	88028e3f-58fb-49e5-84d8-5fc328330f80	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.664899	2025-08-19 21:49:59.664899
327fa909-2a6e-4c1f-a70e-1bde1a54aea6	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.671937	2025-08-19 21:49:59.671937
42c91529-8132-441d-a12d-7153db1a0752	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	e703675f-c6b0-4000-a9df-56758e33236b	NOT_STARTED	\N	2025-08-19 21:49:59.682681	2025-08-19 21:49:59.682681
644d970d-b328-4d2b-8515-d618ee1f84d4	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	b380e8dc-9a61-481b-8ab0-6a63758810b6	IN_PROGRESS	\N	2025-08-19 21:49:59.689449	2025-08-19 21:49:59.689449
ceaa6c97-613b-4359-9163-63d18ca1661b	9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	dc8f1873-59c1-46d0-8479-478040fb2e2d	IN_PROGRESS	\N	2025-08-19 21:49:59.696376	2025-08-19 21:49:59.696376
c1b340a2-cc74-472c-8bff-66328dde19c6	faea2f17-071c-4b09-8d66-47aa7f1c96b5	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.704451	2025-08-19 21:49:59.704451
41e4a651-d0eb-4b13-a6ff-876979d8c536	faea2f17-071c-4b09-8d66-47aa7f1c96b5	557aa861-5434-4983-8caa-62b6512880f1	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.711732	2025-08-19 21:49:59.711732
711432f5-0583-4fd5-b9e8-27532bed4ca3	faea2f17-071c-4b09-8d66-47aa7f1c96b5	373f873b-1a83-4d7f-9dec-5aa36b7daadc	NOT_STARTED	\N	2025-08-19 21:49:59.717962	2025-08-19 21:49:59.717962
3403411b-fc65-4926-8957-75ce332b6edc	faea2f17-071c-4b09-8d66-47aa7f1c96b5	c0854731-59ec-4a91-b357-2a2571a7c0d0	NOT_STARTED	\N	2025-08-19 21:49:59.72731	2025-08-19 21:49:59.72731
e4b91256-c944-41e3-a1c9-503475863836	faea2f17-071c-4b09-8d66-47aa7f1c96b5	6b3395b5-2a30-4dbd-9f94-04e2af015118	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.73411	2025-08-19 21:49:59.73411
63f50c39-79f1-4c19-8049-6b44b6117a1d	faea2f17-071c-4b09-8d66-47aa7f1c96b5	88028e3f-58fb-49e5-84d8-5fc328330f80	NOT_STARTED	\N	2025-08-19 21:49:59.740117	2025-08-19 21:49:59.740117
db1ab4e8-73db-4df5-b159-f5a1c351498e	faea2f17-071c-4b09-8d66-47aa7f1c96b5	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	IN_PROGRESS	\N	2025-08-19 21:49:59.747628	2025-08-19 21:49:59.747628
37c77516-0d62-449d-8b0c-6666590bdbfa	faea2f17-071c-4b09-8d66-47aa7f1c96b5	e703675f-c6b0-4000-a9df-56758e33236b	NOT_STARTED	\N	2025-08-19 21:49:59.754865	2025-08-19 21:49:59.754865
6a7375a6-2f75-4872-ae15-3f46f91b2d72	faea2f17-071c-4b09-8d66-47aa7f1c96b5	b380e8dc-9a61-481b-8ab0-6a63758810b6	IN_PROGRESS	\N	2025-08-19 21:49:59.761102	2025-08-19 21:49:59.761102
5d24207e-c11f-4d44-932c-c359ee2511f4	faea2f17-071c-4b09-8d66-47aa7f1c96b5	dc8f1873-59c1-46d0-8479-478040fb2e2d	NOT_STARTED	\N	2025-08-19 21:49:59.768227	2025-08-19 21:49:59.768227
a050d9fb-8541-4948-bead-5353340a395c	a8851556-7c41-45b4-906b-d4db56f0dae2	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	IN_PROGRESS	\N	2025-08-19 21:49:59.774293	2025-08-19 21:49:59.774293
62d157a5-e74c-4c50-bc83-c3c8dfe64c69	a8851556-7c41-45b4-906b-d4db56f0dae2	557aa861-5434-4983-8caa-62b6512880f1	IN_PROGRESS	\N	2025-08-19 21:49:59.785371	2025-08-19 21:49:59.785371
ccba74f2-fc4c-48aa-bdba-a0aade9be6f0	a8851556-7c41-45b4-906b-d4db56f0dae2	373f873b-1a83-4d7f-9dec-5aa36b7daadc	NOT_STARTED	\N	2025-08-19 21:49:59.791505	2025-08-19 21:49:59.791505
8265e0e1-c1af-461a-a3c3-6fdc34419744	a8851556-7c41-45b4-906b-d4db56f0dae2	c0854731-59ec-4a91-b357-2a2571a7c0d0	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.799187	2025-08-19 21:49:59.799187
aeceba68-a2fd-4a32-9210-bce0f462d5a5	a8851556-7c41-45b4-906b-d4db56f0dae2	6b3395b5-2a30-4dbd-9f94-04e2af015118	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.807051	2025-08-19 21:49:59.807051
1a004632-5d64-4d02-9f1b-c81c1ea06521	a8851556-7c41-45b4-906b-d4db56f0dae2	88028e3f-58fb-49e5-84d8-5fc328330f80	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.814447	2025-08-19 21:49:59.814447
45c64e76-e539-4f17-b425-ad76459b1ce7	a8851556-7c41-45b4-906b-d4db56f0dae2	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	IN_PROGRESS	\N	2025-08-19 21:49:59.820249	2025-08-19 21:49:59.820249
035351a4-73ac-40ab-b306-8329ac9ecdc7	a8851556-7c41-45b4-906b-d4db56f0dae2	e703675f-c6b0-4000-a9df-56758e33236b	NOT_STARTED	\N	2025-08-19 21:49:59.829561	2025-08-19 21:49:59.829561
c5fec8b2-83bf-485a-9517-1a092e48e00b	a8851556-7c41-45b4-906b-d4db56f0dae2	b380e8dc-9a61-481b-8ab0-6a63758810b6	IN_PROGRESS	\N	2025-08-19 21:49:59.836407	2025-08-19 21:49:59.836407
2637f537-8904-412c-994d-ca83ea8c5921	a8851556-7c41-45b4-906b-d4db56f0dae2	dc8f1873-59c1-46d0-8479-478040fb2e2d	IN_PROGRESS	\N	2025-08-19 21:49:59.842627	2025-08-19 21:49:59.842627
7ed3b669-aeb1-4674-af67-4a51d9250a34	b6eacc9f-ddea-41b7-acae-42e45201fae1	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.848765	2025-08-19 21:49:59.848765
fa9fef51-71a1-4d9a-9146-4005de25c5d6	b6eacc9f-ddea-41b7-acae-42e45201fae1	557aa861-5434-4983-8caa-62b6512880f1	NOT_STARTED	\N	2025-08-19 21:49:59.856622	2025-08-19 21:49:59.856622
8c0f34ff-c6eb-47a5-a075-96dbda10e5c4	b6eacc9f-ddea-41b7-acae-42e45201fae1	373f873b-1a83-4d7f-9dec-5aa36b7daadc	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.862927	2025-08-19 21:49:59.862927
9b3916f3-9e5b-4f47-8903-ed14087d36c5	b6eacc9f-ddea-41b7-acae-42e45201fae1	c0854731-59ec-4a91-b357-2a2571a7c0d0	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.869545	2025-08-19 21:49:59.869545
3db3d81d-e585-4a0e-9d35-26ca510aec89	b6eacc9f-ddea-41b7-acae-42e45201fae1	6b3395b5-2a30-4dbd-9f94-04e2af015118	IN_PROGRESS	\N	2025-08-19 21:49:59.875797	2025-08-19 21:49:59.875797
b042ada7-ace5-4a70-b0c6-babda2506f95	b6eacc9f-ddea-41b7-acae-42e45201fae1	88028e3f-58fb-49e5-84d8-5fc328330f80	NOT_STARTED	\N	2025-08-19 21:49:59.885847	2025-08-19 21:49:59.885847
d1ffc26c-4814-4f8f-9004-2bd6e87b2654	b6eacc9f-ddea-41b7-acae-42e45201fae1	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.892161	2025-08-19 21:49:59.892161
9e150f9e-2ed3-4934-8d85-6d69686cd391	b6eacc9f-ddea-41b7-acae-42e45201fae1	e703675f-c6b0-4000-a9df-56758e33236b	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.898448	2025-08-19 21:49:59.898448
6131322f-a916-4d82-883b-65e9a3d5726b	b6eacc9f-ddea-41b7-acae-42e45201fae1	b380e8dc-9a61-481b-8ab0-6a63758810b6	COMPLETED	2025-08-19 14:49:59.425	2025-08-19 21:49:59.907041	2025-08-19 21:49:59.907041
c3805bae-220e-4482-9333-1b4324485df3	b6eacc9f-ddea-41b7-acae-42e45201fae1	dc8f1873-59c1-46d0-8479-478040fb2e2d	IN_PROGRESS	\N	2025-08-19 21:49:59.914414	2025-08-19 21:49:59.914414
53de13c1-978d-4c6a-b3b9-979cbab89163	ea36b494-642c-4de1-b805-bee4428f1971	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	IN_PROGRESS	\N	2025-08-19 21:49:59.921176	2025-08-19 21:49:59.921176
497ad66e-3e4b-4bcc-beba-c51e375e2869	ea36b494-642c-4de1-b805-bee4428f1971	557aa861-5434-4983-8caa-62b6512880f1	NOT_STARTED	\N	2025-08-19 21:49:59.927865	2025-08-19 21:49:59.927865
eb7c0436-d732-4624-8539-e39ae80d7280	ea36b494-642c-4de1-b805-bee4428f1971	373f873b-1a83-4d7f-9dec-5aa36b7daadc	NOT_STARTED	\N	2025-08-19 21:49:59.934429	2025-08-19 21:49:59.934429
782555e7-3254-47d4-ab5b-68ff9be9d9a1	ea36b494-642c-4de1-b805-bee4428f1971	c0854731-59ec-4a91-b357-2a2571a7c0d0	IN_PROGRESS	\N	2025-08-19 21:49:59.940968	2025-08-19 21:49:59.940968
e9069977-d475-4f75-8bf8-b6bc1f20861d	ea36b494-642c-4de1-b805-bee4428f1971	6b3395b5-2a30-4dbd-9f94-04e2af015118	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:49:59.948043	2025-08-19 21:49:59.948043
8d833aed-ff7e-4382-aa2d-af0d3b5acb76	ea36b494-642c-4de1-b805-bee4428f1971	88028e3f-58fb-49e5-84d8-5fc328330f80	IN_PROGRESS	\N	2025-08-19 21:49:59.955766	2025-08-19 21:49:59.955766
1e90f2cf-7a1b-43dd-a02a-e481139e7693	ea36b494-642c-4de1-b805-bee4428f1971	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	NOT_STARTED	\N	2025-08-19 21:49:59.963166	2025-08-19 21:49:59.963166
54be344c-7742-4689-9fdf-7375170ce9e6	ea36b494-642c-4de1-b805-bee4428f1971	e703675f-c6b0-4000-a9df-56758e33236b	NOT_STARTED	\N	2025-08-19 21:49:59.970063	2025-08-19 21:49:59.970063
98ee1f03-17ca-4030-a44d-641ee105a48b	ea36b494-642c-4de1-b805-bee4428f1971	b380e8dc-9a61-481b-8ab0-6a63758810b6	IN_PROGRESS	\N	2025-08-19 21:49:59.97643	2025-08-19 21:49:59.97643
d4fc977e-b3c2-43e9-affb-a4320b607650	ea36b494-642c-4de1-b805-bee4428f1971	dc8f1873-59c1-46d0-8479-478040fb2e2d	NOT_STARTED	\N	2025-08-19 21:49:59.986076	2025-08-19 21:49:59.986076
cad9ef96-1c51-44b9-9605-53bc71488141	e568bbee-20af-4df1-b779-ee29149510c3	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:49:59.992693	2025-08-19 21:49:59.992693
66888bac-dcb3-4488-aa85-e17af20bbb79	e568bbee-20af-4df1-b779-ee29149510c3	557aa861-5434-4983-8caa-62b6512880f1	IN_PROGRESS	\N	2025-08-19 21:50:00.000041	2025-08-19 21:50:00.000041
b9a4e033-84ed-494d-b607-713b2f2b1206	e568bbee-20af-4df1-b779-ee29149510c3	373f873b-1a83-4d7f-9dec-5aa36b7daadc	NOT_STARTED	\N	2025-08-19 21:50:00.006428	2025-08-19 21:50:00.006428
3b4c8849-03a7-4a05-bc2a-cee18d89de7c	e568bbee-20af-4df1-b779-ee29149510c3	c0854731-59ec-4a91-b357-2a2571a7c0d0	NOT_STARTED	\N	2025-08-19 21:50:00.012785	2025-08-19 21:50:00.012785
312fddd7-a4cf-4009-8ef5-f89d3cce4ace	e568bbee-20af-4df1-b779-ee29149510c3	6b3395b5-2a30-4dbd-9f94-04e2af015118	IN_PROGRESS	\N	2025-08-19 21:50:00.018963	2025-08-19 21:50:00.018963
2172a841-5899-434b-9f46-f1e9f6d29c04	e568bbee-20af-4df1-b779-ee29149510c3	88028e3f-58fb-49e5-84d8-5fc328330f80	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.025305	2025-08-19 21:50:00.025305
a95ef720-f398-4b03-8ff7-d666d3329aba	e568bbee-20af-4df1-b779-ee29149510c3	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	IN_PROGRESS	\N	2025-08-19 21:50:00.034627	2025-08-19 21:50:00.034627
140a9708-140e-4fad-830f-66bd751c67e0	e568bbee-20af-4df1-b779-ee29149510c3	e703675f-c6b0-4000-a9df-56758e33236b	IN_PROGRESS	\N	2025-08-19 21:50:00.040919	2025-08-19 21:50:00.040919
1fa83514-91b9-4f8e-b98f-fd523a6ac96b	e568bbee-20af-4df1-b779-ee29149510c3	b380e8dc-9a61-481b-8ab0-6a63758810b6	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.04789	2025-08-19 21:50:00.04789
686bbc13-dda4-41c6-8cd6-fca4026a19ca	e568bbee-20af-4df1-b779-ee29149510c3	dc8f1873-59c1-46d0-8479-478040fb2e2d	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.054923	2025-08-19 21:50:00.054923
182c0f42-7037-4b35-855d-7979cf0af7f1	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	NOT_STARTED	\N	2025-08-19 21:50:00.06133	2025-08-19 21:50:00.06133
b30689e7-a0e2-4712-a22f-c3898c05f516	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	557aa861-5434-4983-8caa-62b6512880f1	NOT_STARTED	\N	2025-08-19 21:50:00.067987	2025-08-19 21:50:00.067987
df4b750a-46e5-46ed-aa95-6e515c4a282f	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	373f873b-1a83-4d7f-9dec-5aa36b7daadc	NOT_STARTED	\N	2025-08-19 21:50:00.074891	2025-08-19 21:50:00.074891
366e5c35-de61-455a-95f3-be0c0f4fb034	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	c0854731-59ec-4a91-b357-2a2571a7c0d0	NOT_STARTED	\N	2025-08-19 21:50:00.083246	2025-08-19 21:50:00.083246
5cfee2dd-51b1-44d5-a5d8-71e745a4a665	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	6b3395b5-2a30-4dbd-9f94-04e2af015118	IN_PROGRESS	\N	2025-08-19 21:50:00.092088	2025-08-19 21:50:00.092088
71065afb-2d9b-4a38-9365-a1476106ede3	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	88028e3f-58fb-49e5-84d8-5fc328330f80	NOT_STARTED	\N	2025-08-19 21:50:00.098515	2025-08-19 21:50:00.098515
5eba0c8b-a9f4-4f06-b169-ecd6af3e5506	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.105716	2025-08-19 21:50:00.105716
30bac3c2-c4fa-496b-a78e-971802a07497	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	e703675f-c6b0-4000-a9df-56758e33236b	NOT_STARTED	\N	2025-08-19 21:50:00.112084	2025-08-19 21:50:00.112084
610ef119-b70c-4a1d-91d0-3f842a83fc8e	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	b380e8dc-9a61-481b-8ab0-6a63758810b6	IN_PROGRESS	\N	2025-08-19 21:50:00.118206	2025-08-19 21:50:00.118206
f86a0d9b-7bd5-49f6-86fb-b18b07f5c217	51eea9f7-9044-4f73-a4be-1a0f712c8bc9	dc8f1873-59c1-46d0-8479-478040fb2e2d	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.124357	2025-08-19 21:50:00.124357
5300b9ab-a71e-49cf-9dd6-6924e8804632	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.132078	2025-08-19 21:50:00.132078
87b67925-9577-4cf2-b762-46b6b6e59a7a	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	557aa861-5434-4983-8caa-62b6512880f1	NOT_STARTED	\N	2025-08-19 21:50:00.139101	2025-08-19 21:50:00.139101
cdd42c68-2236-45c4-b976-216e4960e368	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	373f873b-1a83-4d7f-9dec-5aa36b7daadc	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.144721	2025-08-19 21:50:00.144721
d8636450-9b96-4766-a36f-a37e78712aee	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	c0854731-59ec-4a91-b357-2a2571a7c0d0	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.152753	2025-08-19 21:50:00.152753
480f4720-0dfe-41de-b7d5-1a3b808065e1	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	6b3395b5-2a30-4dbd-9f94-04e2af015118	IN_PROGRESS	\N	2025-08-19 21:50:00.159407	2025-08-19 21:50:00.159407
419bdc7b-008e-49dd-b01d-9822e8a26c7c	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	88028e3f-58fb-49e5-84d8-5fc328330f80	IN_PROGRESS	\N	2025-08-19 21:50:00.165881	2025-08-19 21:50:00.165881
3d3f5fd2-3572-402f-a5a9-7de87b79db9e	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	IN_PROGRESS	\N	2025-08-19 21:50:00.174695	2025-08-19 21:50:00.174695
60959f87-fc7e-4e1f-9833-2de68de91127	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	e703675f-c6b0-4000-a9df-56758e33236b	NOT_STARTED	\N	2025-08-19 21:50:00.183075	2025-08-19 21:50:00.183075
9af21661-4cf2-4a9f-9f49-af1df505237b	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	b380e8dc-9a61-481b-8ab0-6a63758810b6	IN_PROGRESS	\N	2025-08-19 21:50:00.195166	2025-08-19 21:50:00.195166
3014ce9b-92a7-4791-9e72-fc9d5868febe	ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	dc8f1873-59c1-46d0-8479-478040fb2e2d	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.204057	2025-08-19 21:50:00.204057
64381f67-7882-4b8f-967f-a18b5f3c244e	393361ca-ff50-43a1-81f9-c4093262fc19	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	IN_PROGRESS	\N	2025-08-19 21:50:00.212585	2025-08-19 21:50:00.212585
37d8db53-e65e-4592-ad9c-9e0dfd3d8ebd	393361ca-ff50-43a1-81f9-c4093262fc19	557aa861-5434-4983-8caa-62b6512880f1	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.221773	2025-08-19 21:50:00.221773
95d34790-4b83-4b9f-8733-37db2a4a3294	393361ca-ff50-43a1-81f9-c4093262fc19	373f873b-1a83-4d7f-9dec-5aa36b7daadc	IN_PROGRESS	\N	2025-08-19 21:50:00.234481	2025-08-19 21:50:00.234481
b89143f9-733b-4c06-872c-3cf6b01b443a	393361ca-ff50-43a1-81f9-c4093262fc19	c0854731-59ec-4a91-b357-2a2571a7c0d0	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.242189	2025-08-19 21:50:00.242189
a08c4010-76ab-4dbe-8ef5-2a4817bb9b46	393361ca-ff50-43a1-81f9-c4093262fc19	6b3395b5-2a30-4dbd-9f94-04e2af015118	NOT_STARTED	\N	2025-08-19 21:50:00.250733	2025-08-19 21:50:00.250733
90bd2d97-ed01-43f1-98a5-3762ecca15aa	393361ca-ff50-43a1-81f9-c4093262fc19	88028e3f-58fb-49e5-84d8-5fc328330f80	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.259042	2025-08-19 21:50:00.259042
bfc99f6a-8c05-4c81-b14e-f22d7e1db6c8	393361ca-ff50-43a1-81f9-c4093262fc19	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	NOT_STARTED	\N	2025-08-19 21:50:00.265594	2025-08-19 21:50:00.265594
6896b5fb-cf96-4ea2-88b4-e3fbed452d26	393361ca-ff50-43a1-81f9-c4093262fc19	e703675f-c6b0-4000-a9df-56758e33236b	IN_PROGRESS	\N	2025-08-19 21:50:00.272392	2025-08-19 21:50:00.272392
524569d8-2cac-4a40-8f12-c3333392c4f3	393361ca-ff50-43a1-81f9-c4093262fc19	b380e8dc-9a61-481b-8ab0-6a63758810b6	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.277798	2025-08-19 21:50:00.277798
4a78e077-14e2-4b28-a15f-3d18f99a9679	393361ca-ff50-43a1-81f9-c4093262fc19	dc8f1873-59c1-46d0-8479-478040fb2e2d	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.283245	2025-08-19 21:50:00.283245
f22ee8c2-c47d-46bb-8362-51eedd0f175d	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.292529	2025-08-19 21:50:00.292529
4101c422-82c0-4a55-b38a-2fc5ee6bd0a9	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	557aa861-5434-4983-8caa-62b6512880f1	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.298076	2025-08-19 21:50:00.298076
9536718a-bc4d-433c-ba05-d31063d50d80	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	373f873b-1a83-4d7f-9dec-5aa36b7daadc	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.305177	2025-08-19 21:50:00.305177
1b97c203-7426-45fa-b60c-284da91efcbf	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	c0854731-59ec-4a91-b357-2a2571a7c0d0	NOT_STARTED	\N	2025-08-19 21:50:00.312383	2025-08-19 21:50:00.312383
0c4b380a-551f-497f-9aca-d6b08913eeeb	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	6b3395b5-2a30-4dbd-9f94-04e2af015118	NOT_STARTED	\N	2025-08-19 21:50:00.318946	2025-08-19 21:50:00.318946
75fbb18c-04f4-4979-b910-dce72c160bf5	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	88028e3f-58fb-49e5-84d8-5fc328330f80	IN_PROGRESS	\N	2025-08-19 21:50:00.323909	2025-08-19 21:50:00.323909
f5930949-ff3b-4e41-ad29-adb36ec545c0	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.328874	2025-08-19 21:50:00.328874
83c63b74-74f8-4474-b535-d182a2e6d1cc	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	e703675f-c6b0-4000-a9df-56758e33236b	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.336895	2025-08-19 21:50:00.336895
4b75c358-4bfa-4249-8e95-c8d49c25a34c	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	b380e8dc-9a61-481b-8ab0-6a63758810b6	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.344304	2025-08-19 21:50:00.344304
f4b385c9-dd15-4ddd-b7ec-a9080c3cda05	506cfdbb-f97b-41a2-94a8-42e27f0f20ba	dc8f1873-59c1-46d0-8479-478040fb2e2d	IN_PROGRESS	\N	2025-08-19 21:50:00.351273	2025-08-19 21:50:00.351273
ddd472a4-53c8-47bf-872e-7bcc869a9ad3	d782a2ca-e67c-4796-8829-9277a76515a9	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.35995	2025-08-19 21:50:00.35995
6469a24a-6792-4494-b356-4c1b85cb974a	d782a2ca-e67c-4796-8829-9277a76515a9	557aa861-5434-4983-8caa-62b6512880f1	IN_PROGRESS	\N	2025-08-19 21:50:00.364751	2025-08-19 21:50:00.364751
7d2bd553-96a4-416d-87ea-90cbe2d9c0a9	d782a2ca-e67c-4796-8829-9277a76515a9	373f873b-1a83-4d7f-9dec-5aa36b7daadc	IN_PROGRESS	\N	2025-08-19 21:50:00.372	2025-08-19 21:50:00.372
46e7f356-7a20-4e66-ac57-d394ddd75734	d782a2ca-e67c-4796-8829-9277a76515a9	c0854731-59ec-4a91-b357-2a2571a7c0d0	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.378627	2025-08-19 21:50:00.378627
140580d8-2622-4900-86e1-c03464227444	d782a2ca-e67c-4796-8829-9277a76515a9	6b3395b5-2a30-4dbd-9f94-04e2af015118	NOT_STARTED	\N	2025-08-19 21:50:00.385586	2025-08-19 21:50:00.385586
1e55c06b-c3c8-4283-bd0d-e781abf5c12c	d782a2ca-e67c-4796-8829-9277a76515a9	88028e3f-58fb-49e5-84d8-5fc328330f80	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.391725	2025-08-19 21:50:00.391725
ffc17ac8-744e-4095-9d1b-f0baa9d6e8d4	d782a2ca-e67c-4796-8829-9277a76515a9	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	IN_PROGRESS	\N	2025-08-19 21:50:00.399483	2025-08-19 21:50:00.399483
2d8ab7f5-c715-44b5-a348-0124b33c4072	d782a2ca-e67c-4796-8829-9277a76515a9	e703675f-c6b0-4000-a9df-56758e33236b	NOT_STARTED	\N	2025-08-19 21:50:00.405971	2025-08-19 21:50:00.405971
bd9c3e91-0c70-4ffb-914a-abc2a2aafc9f	d782a2ca-e67c-4796-8829-9277a76515a9	b380e8dc-9a61-481b-8ab0-6a63758810b6	IN_PROGRESS	\N	2025-08-19 21:50:00.411588	2025-08-19 21:50:00.411588
18353689-10b7-4bc6-b14f-227af29aa1c9	d782a2ca-e67c-4796-8829-9277a76515a9	dc8f1873-59c1-46d0-8479-478040fb2e2d	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.4183	2025-08-19 21:50:00.4183
dd2c15ba-1519-49ae-bc79-8ac74f963e21	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	IN_PROGRESS	\N	2025-08-19 21:50:00.424209	2025-08-19 21:50:00.424209
55998e36-4ad1-4cb6-bc10-25bc89814160	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	557aa861-5434-4983-8caa-62b6512880f1	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.430565	2025-08-19 21:50:00.430565
138199a3-b831-49b8-9004-21aa0ef8644c	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	373f873b-1a83-4d7f-9dec-5aa36b7daadc	IN_PROGRESS	\N	2025-08-19 21:50:00.43937	2025-08-19 21:50:00.43937
43806b72-16e6-4151-b217-2dcb41366d98	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	c0854731-59ec-4a91-b357-2a2571a7c0d0	NOT_STARTED	\N	2025-08-19 21:50:00.444795	2025-08-19 21:50:00.444795
41533471-ad39-40df-ad31-131f031858cc	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	6b3395b5-2a30-4dbd-9f94-04e2af015118	IN_PROGRESS	\N	2025-08-19 21:50:00.451782	2025-08-19 21:50:00.451782
62c1332d-cfcc-4607-bba3-7ec65b8cb561	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	88028e3f-58fb-49e5-84d8-5fc328330f80	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.458508	2025-08-19 21:50:00.458508
4135f584-bb4e-48fc-9159-91b65657f689	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	NOT_STARTED	\N	2025-08-19 21:50:00.464583	2025-08-19 21:50:00.464583
3446578b-4cae-43e9-8b58-82f582d66f74	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	e703675f-c6b0-4000-a9df-56758e33236b	IN_PROGRESS	\N	2025-08-19 21:50:00.470218	2025-08-19 21:50:00.470218
8909770f-fb73-4a3d-aed0-8ca4c9e90702	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	b380e8dc-9a61-481b-8ab0-6a63758810b6	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.475574	2025-08-19 21:50:00.475574
d7ce27bc-a96f-45bb-9a5a-a88952e0e8f4	f895bae8-2fc9-4e6e-90f0-cade4960c4ac	dc8f1873-59c1-46d0-8479-478040fb2e2d	IN_PROGRESS	\N	2025-08-19 21:50:00.481184	2025-08-19 21:50:00.481184
b1e4823b-7e72-4310-964c-7a525bec6eae	750ad13a-23c8-4f90-98f1-a3af8c91b43c	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	NOT_STARTED	\N	2025-08-19 21:50:00.486857	2025-08-19 21:50:00.486857
f70b8ca7-fa00-496e-a8bb-700a5b9b973c	750ad13a-23c8-4f90-98f1-a3af8c91b43c	557aa861-5434-4983-8caa-62b6512880f1	IN_PROGRESS	\N	2025-08-19 21:50:00.492571	2025-08-19 21:50:00.492571
536ba90c-07b6-4de5-82f9-2d763c6483d4	750ad13a-23c8-4f90-98f1-a3af8c91b43c	373f873b-1a83-4d7f-9dec-5aa36b7daadc	IN_PROGRESS	\N	2025-08-19 21:50:00.498662	2025-08-19 21:50:00.498662
9c1f560a-bb5d-42e5-826b-574aa1a03a5e	750ad13a-23c8-4f90-98f1-a3af8c91b43c	c0854731-59ec-4a91-b357-2a2571a7c0d0	NOT_STARTED	\N	2025-08-19 21:50:00.504844	2025-08-19 21:50:00.504844
58804eb1-aa47-407c-affe-83e177fcdc5d	750ad13a-23c8-4f90-98f1-a3af8c91b43c	6b3395b5-2a30-4dbd-9f94-04e2af015118	IN_PROGRESS	\N	2025-08-19 21:50:00.510547	2025-08-19 21:50:00.510547
c3c09e05-be11-41e4-bf7e-5a69a7bcf305	750ad13a-23c8-4f90-98f1-a3af8c91b43c	88028e3f-58fb-49e5-84d8-5fc328330f80	IN_PROGRESS	\N	2025-08-19 21:50:00.515373	2025-08-19 21:50:00.515373
52ca2532-184e-43bf-80a6-53d6232c89bf	750ad13a-23c8-4f90-98f1-a3af8c91b43c	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.522639	2025-08-19 21:50:00.522639
5663e1f1-faf9-4b60-a88d-7f75551c61b6	750ad13a-23c8-4f90-98f1-a3af8c91b43c	e703675f-c6b0-4000-a9df-56758e33236b	NOT_STARTED	\N	2025-08-19 21:50:00.528548	2025-08-19 21:50:00.528548
d692b447-3c26-4ae9-9083-a4c2f7584f0d	750ad13a-23c8-4f90-98f1-a3af8c91b43c	b380e8dc-9a61-481b-8ab0-6a63758810b6	NOT_STARTED	\N	2025-08-19 21:50:00.534893	2025-08-19 21:50:00.534893
263f41f0-3b37-4181-877d-7a9ec2cb5bc0	750ad13a-23c8-4f90-98f1-a3af8c91b43c	dc8f1873-59c1-46d0-8479-478040fb2e2d	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.541625	2025-08-19 21:50:00.541625
11ec8569-4fb2-4f1e-895f-657b030b4210	ba840c09-cce3-4f79-bf56-e8f5d119b651	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	NOT_STARTED	\N	2025-08-19 21:50:00.547216	2025-08-19 21:50:00.547216
33925037-16d3-479d-ae11-2f1c23c5bb35	ba840c09-cce3-4f79-bf56-e8f5d119b651	557aa861-5434-4983-8caa-62b6512880f1	IN_PROGRESS	\N	2025-08-19 21:50:00.554898	2025-08-19 21:50:00.554898
d6d3175d-cf8f-44ca-83e3-73f7d2ab6abc	ba840c09-cce3-4f79-bf56-e8f5d119b651	373f873b-1a83-4d7f-9dec-5aa36b7daadc	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.559808	2025-08-19 21:50:00.559808
9e86677a-4549-4e8d-97d8-7700e522c5b6	ba840c09-cce3-4f79-bf56-e8f5d119b651	c0854731-59ec-4a91-b357-2a2571a7c0d0	NOT_STARTED	\N	2025-08-19 21:50:00.56545	2025-08-19 21:50:00.56545
a3d10574-aaca-49d8-9d42-c9aaed4f5ffc	ba840c09-cce3-4f79-bf56-e8f5d119b651	6b3395b5-2a30-4dbd-9f94-04e2af015118	IN_PROGRESS	\N	2025-08-19 21:50:00.572	2025-08-19 21:50:00.572
f07bf0da-8c7a-46de-83d1-6a01dbb1e0e9	ba840c09-cce3-4f79-bf56-e8f5d119b651	88028e3f-58fb-49e5-84d8-5fc328330f80	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.577624	2025-08-19 21:50:00.577624
23fc1a9d-220a-4017-a0d4-b75455c7b1b0	ba840c09-cce3-4f79-bf56-e8f5d119b651	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.58208	2025-08-19 21:50:00.58208
27319bd2-dfe0-4f9d-8872-e924006c8581	ba840c09-cce3-4f79-bf56-e8f5d119b651	e703675f-c6b0-4000-a9df-56758e33236b	IN_PROGRESS	\N	2025-08-19 21:50:00.588842	2025-08-19 21:50:00.588842
f33007e1-8f9e-45ee-8bc1-d02dbbf38fbf	ba840c09-cce3-4f79-bf56-e8f5d119b651	b380e8dc-9a61-481b-8ab0-6a63758810b6	IN_PROGRESS	\N	2025-08-19 21:50:00.59533	2025-08-19 21:50:00.59533
c26c5773-f480-4038-8fe8-973ebcbf6d66	ba840c09-cce3-4f79-bf56-e8f5d119b651	dc8f1873-59c1-46d0-8479-478040fb2e2d	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.603625	2025-08-19 21:50:00.603625
fa0f9705-79a8-478f-97f4-537029680a92	552702f7-397a-4dcd-b01e-4009d2a2c74e	93bd3ffb-9f31-40c0-8aa6-89c74df64d68	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.608805	2025-08-19 21:50:00.608805
1d0db873-c7ed-404c-a2e3-98faebce6c3e	552702f7-397a-4dcd-b01e-4009d2a2c74e	557aa861-5434-4983-8caa-62b6512880f1	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.61386	2025-08-19 21:50:00.61386
fd4ac564-8228-4432-b536-ce346a04e6f8	552702f7-397a-4dcd-b01e-4009d2a2c74e	373f873b-1a83-4d7f-9dec-5aa36b7daadc	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.620928	2025-08-19 21:50:00.620928
b1c9fe96-888a-48bb-bb36-3db880527e95	552702f7-397a-4dcd-b01e-4009d2a2c74e	c0854731-59ec-4a91-b357-2a2571a7c0d0	NOT_STARTED	\N	2025-08-19 21:50:00.625591	2025-08-19 21:50:00.625591
c66fe73a-0ca9-4447-aaef-4dbb647a0d24	552702f7-397a-4dcd-b01e-4009d2a2c74e	6b3395b5-2a30-4dbd-9f94-04e2af015118	NOT_STARTED	\N	2025-08-19 21:50:00.630553	2025-08-19 21:50:00.630553
93429a4c-bce1-465e-a47a-ab4f0fb91641	552702f7-397a-4dcd-b01e-4009d2a2c74e	88028e3f-58fb-49e5-84d8-5fc328330f80	IN_PROGRESS	\N	2025-08-19 21:50:00.635654	2025-08-19 21:50:00.635654
691685c5-33d6-4eca-baf6-b64a41d1bfd2	552702f7-397a-4dcd-b01e-4009d2a2c74e	c2b16ebb-0393-43f9-bfe6-5c619ab1f71a	IN_PROGRESS	\N	2025-08-19 21:50:00.644088	2025-08-19 21:50:00.644088
5612f4a7-c3da-4a8c-9df7-9fa2d44e23e6	552702f7-397a-4dcd-b01e-4009d2a2c74e	e703675f-c6b0-4000-a9df-56758e33236b	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.650022	2025-08-19 21:50:00.650022
3e135a4f-a133-4455-8743-112bcbb86a6f	552702f7-397a-4dcd-b01e-4009d2a2c74e	b380e8dc-9a61-481b-8ab0-6a63758810b6	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.657993	2025-08-19 21:50:00.657993
b687a49f-4ff4-4fcf-acf3-b4d642311b17	552702f7-397a-4dcd-b01e-4009d2a2c74e	dc8f1873-59c1-46d0-8479-478040fb2e2d	COMPLETED	2025-08-19 14:49:59.426	2025-08-19 21:50:00.664783	2025-08-19 21:50:00.664783
\.


--
-- TOC entry 3679 (class 0 OID 25086)
-- Dependencies: 229
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: reffrains
--

COPY public.users (id, email, password, name, role, "isActive", "refreshToken", "refreshTokenExpiresAt", "resetToken", "resetTokenExpiresAt", "lastLoginAt", "passwordChangedAt", "loginAttempts", "lockedUntil", "emailVerified", "emailVerificationToken", "emailVerificationExpiresAt", "createdAt", "updatedAt") FROM stdin;
85148270-e5ad-458d-a22b-68b75e07308b	admin@lms.com	$2b$12$62QUj0GX.g8e1i3ytXaYM.Y6q6y/M9m4G2wG57bY3jLDcbNfFK.4S	Admin LMS	ADMIN	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:51.916918	2025-08-19 21:49:51.916918
ac0b6962-3e73-431a-8e2b-de4c13439c9f	admin2@lms.com	$2b$12$35yfxW57z4kUtlQfL1LkLO3/s8Gr.OjqSYlaRcdU50vgUYzgxsj3O	Super Admin	ADMIN	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:52.291439	2025-08-19 21:49:52.291439
6f6a2ca0-bd0e-48da-9a0b-b68e1853cf0d	guru1@lms.com	$2b$12$1d.G.JMGomkd5e4If/pgS.iBlAwI9lQAgk2Y3rXyIPu9nggBa6J5O	Dr. Budi Santoso	GURU	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:52.719402	2025-08-19 21:49:52.719402
e0af000d-5904-4f51-b68a-64679877c2ee	guru2@lms.com	$2b$12$TgeCQMO.eOSHLu/ZXxaIVuP29uTBFKwPvr2BRypKDCua2hEo6dG2a	Prof. Sari Dewi	GURU	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:53.104197	2025-08-19 21:49:53.104197
f5fe8b63-0fb3-45af-8550-9da36fc701f0	guru3@lms.com	$2b$12$SSIGRHrcVsKKU9SEo/m41eD5dFiN5w7jtAIqujAYuBwwuHn7LQjLG	Drs. Ahmad Wijaya	GURU	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:53.50155	2025-08-19 21:49:53.50155
faea2f17-071c-4b09-8d66-47aa7f1c96b5	siswa2@lms.com	$2b$12$1pQNEIOzClcYPieU/UU4Iu1uhFb/P.T1Z/OlLqMZwBU1lmslhP022	Siti Nurhaliza	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:54.235629	2025-08-19 21:49:54.235629
a8851556-7c41-45b4-906b-d4db56f0dae2	siswa3@lms.com	$2b$12$iQ322j4icN8SA8MP6OgvMucWL8V/KBNT.W.Z5r.VnChT/do8hT80S	Budi Pratama	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:54.580523	2025-08-19 21:49:54.580523
b6eacc9f-ddea-41b7-acae-42e45201fae1	siswa4@lms.com	$2b$12$eFf7QZMRyPiP25IgRRbrQ.OaM2VXiD1D8j3XvAojAQcx48qpHz4Ke	Dewi Sartika	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:54.926354	2025-08-19 21:49:54.926354
ea36b494-642c-4de1-b805-bee4428f1971	siswa5@lms.com	$2b$12$I1yfdX5YZOd8i80roRknwetm03IUN4U9rsHIkAwHgSstXzlnI7QXK	Eko Prasetyo	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:55.269317	2025-08-19 21:49:55.269317
e568bbee-20af-4df1-b779-ee29149510c3	siswa6@lms.com	$2b$12$wc7g5IFQrvaaKAke658mCO0.CRHWGla0RkZOjDU9a8WoZda2F0kl2	Fitri Handayani	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:55.610773	2025-08-19 21:49:55.610773
51eea9f7-9044-4f73-a4be-1a0f712c8bc9	siswa7@lms.com	$2b$12$REWb.DYQhy6It6HWJGg4CeX7UM4kFytxhvgsSvrmzN.h84OGZHUCy	Gilang Ramadhan	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:55.959245	2025-08-19 21:49:55.959245
ffb35efa-34e3-4de6-8d0f-6ddb5e7eb8d8	siswa8@lms.com	$2b$12$igENupm1VK3zzWvfgpml7e2R2wTgchQ/vujOneNLc8SE8pWHde5ye	Hani Safitri	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:56.302205	2025-08-19 21:49:56.302205
393361ca-ff50-43a1-81f9-c4093262fc19	siswa9@lms.com	$2b$12$rkyx8pVZjwkb68emva0HWOM44.NrDA8k3phEkcPM0jpo3tTFXTdiC	Indra Gunawan	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:56.644214	2025-08-19 21:49:56.644214
506cfdbb-f97b-41a2-94a8-42e27f0f20ba	siswa10@lms.com	$2b$12$d1bxxFtWoHg1bIa9Ifx3Vu6aXApyVR99GQrQYNxdjTfdrOw5KEDCy	Joko Widodo	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:56.991388	2025-08-19 21:49:56.991388
d782a2ca-e67c-4796-8829-9277a76515a9	siswa11@lms.com	$2b$12$2jweouisGxYpNJgUaMPmEO86.HLp/3SYDYM/RL9mEl94jdB3DkN3K	Kartika Sari	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:57.332384	2025-08-19 21:49:57.332384
f895bae8-2fc9-4e6e-90f0-cade4960c4ac	siswa12@lms.com	$2b$12$.Av6.hvv1eGjmmSiHxdNVe/W7VpU5rdUvVlyBq608/vCg6JzUJk22	Lestari Wulan	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:57.675257	2025-08-19 21:49:57.675257
750ad13a-23c8-4f90-98f1-a3af8c91b43c	siswa13@lms.com	$2b$12$Txs8KjOVEAZQmJbg5ExqBuND9hisLlXjuYJ4bk0dfoBVuukrWCDou	Muhammad Fajar	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:58.019855	2025-08-19 21:49:58.019855
ba840c09-cce3-4f79-bf56-e8f5d119b651	siswa14@lms.com	$2b$12$mYz2e2ZM3cGguPQZZX3sBuQILva7NP7qaCHC6r/JHJ5T1I/iSbZEO	Nurul Hidayah	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:58.361404	2025-08-19 21:49:58.361404
552702f7-397a-4dcd-b01e-4009d2a2c74e	siswa15@lms.com	$2b$12$gsTs1gsnY8Y.zbJQBoh5feoXSfMn1wdvKkWNVXXNzMo4IqOb11v6W	Oki Setiawan	SISWA	t	\N	\N	\N	\N	\N	\N	0	\N	t	\N	\N	2025-08-19 21:49:58.701083	2025-08-19 21:49:58.701083
9a3aabaa-6f25-4cb2-b5d2-f6bd5a0ac105	siswa1@lms.com	$2b$12$ZYhKKv1fB/9hjiRUZXn9jumAsze.y6Zb/iPqRl99M1Kx9aI5O062a	Ahmad Rizki	SISWA	t	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YTNhYWJhYS02ZjI1LTRjYjItYjVkMi1mNmJkNWEwYWMxMDUiLCJlbWFpbCI6InNpc3dhMUBsbXMuY29tIiwicm9sZSI6IlNJU1dBIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NTU2MTUyNTYsImV4cCI6MTc1NjIyMDA1Nn0.QreCPaLHJPAd1_1I4-Z90xosSNG36mhfkI2akM6HdUI	2025-08-26 14:54:16.641	\N	\N	2025-08-19 14:54:16.58	\N	0	\N	t	\N	\N	2025-08-19 21:49:53.879017	2025-08-19 14:54:16.641
\.


--
-- TOC entry 3409 (class 2606 OID 24947)
-- Name: ai_chat_logs ai_chat_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.ai_chat_logs
    ADD CONSTRAINT ai_chat_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3418 (class 2606 OID 24961)
-- Name: ai_generated_content ai_content_subchapter_initial_unique; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.ai_generated_content
    ADD CONSTRAINT ai_content_subchapter_initial_unique UNIQUE ("subchapterId", "isInitial");


--
-- TOC entry 3421 (class 2606 OID 24959)
-- Name: ai_generated_content ai_generated_content_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.ai_generated_content
    ADD CONSTRAINT ai_generated_content_pkey PRIMARY KEY (id);


--
-- TOC entry 3425 (class 2606 OID 24973)
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- TOC entry 3431 (class 2606 OID 24975)
-- Name: chapters chapters_title_subject_unique; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_title_subject_unique UNIQUE (title, "subjectId");


--
-- TOC entry 3434 (class 2606 OID 24986)
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- TOC entry 3437 (class 2606 OID 24988)
-- Name: grades grades_title_unique; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_title_unique UNIQUE (title);


--
-- TOC entry 3440 (class 2606 OID 24999)
-- Name: metahuman_sessions metahuman_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.metahuman_sessions
    ADD CONSTRAINT metahuman_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3448 (class 2606 OID 25010)
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- TOC entry 3455 (class 2606 OID 25022)
-- Name: quiz_questions quiz_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 3460 (class 2606 OID 25034)
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- TOC entry 3464 (class 2606 OID 25036)
-- Name: quizzes quizzes_subchapter_title_unique; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_subchapter_title_unique UNIQUE ("subchapterId", title);


--
-- TOC entry 3471 (class 2606 OID 25047)
-- Name: subchapter_materials subchapter_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.subchapter_materials
    ADD CONSTRAINT subchapter_materials_pkey PRIMARY KEY (id);


--
-- TOC entry 3478 (class 2606 OID 25059)
-- Name: subchapters subchapters_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.subchapters
    ADD CONSTRAINT subchapters_pkey PRIMARY KEY (id);


--
-- TOC entry 3480 (class 2606 OID 25061)
-- Name: subchapters subchapters_title_chapter_unique; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.subchapters
    ADD CONSTRAINT subchapters_title_chapter_unique UNIQUE (title, "chapterId");


--
-- TOC entry 3486 (class 2606 OID 25072)
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- TOC entry 3488 (class 2606 OID 25074)
-- Name: subjects subjects_title_grade_unique; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_title_grade_unique UNIQUE (title, "gradeId");


--
-- TOC entry 3491 (class 2606 OID 25083)
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- TOC entry 3497 (class 2606 OID 25085)
-- Name: user_progress user_progress_user_subchapter_unique; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_subchapter_unique UNIQUE ("userId", "subchapterId");


--
-- TOC entry 3502 (class 2606 OID 25101)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3504 (class 2606 OID 25099)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3406 (class 1259 OID 25185)
-- Name: ai_chat_logs_created_at_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_chat_logs_created_at_idx ON public.ai_chat_logs USING btree ("createdAt");


--
-- TOC entry 3407 (class 1259 OID 25184)
-- Name: ai_chat_logs_message_type_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_chat_logs_message_type_idx ON public.ai_chat_logs USING btree ("messageType");


--
-- TOC entry 3410 (class 1259 OID 25183)
-- Name: ai_chat_logs_subchapter_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_chat_logs_subchapter_idx ON public.ai_chat_logs USING btree ("subchapterId");


--
-- TOC entry 3411 (class 1259 OID 25187)
-- Name: ai_chat_logs_user_created_at_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_chat_logs_user_created_at_idx ON public.ai_chat_logs USING btree ("userId", "createdAt");


--
-- TOC entry 3412 (class 1259 OID 25182)
-- Name: ai_chat_logs_user_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_chat_logs_user_idx ON public.ai_chat_logs USING btree ("userId");


--
-- TOC entry 3413 (class 1259 OID 25186)
-- Name: ai_chat_logs_user_subchapter_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_chat_logs_user_subchapter_idx ON public.ai_chat_logs USING btree ("userId", "subchapterId");


--
-- TOC entry 3414 (class 1259 OID 25189)
-- Name: ai_content_initial_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_content_initial_idx ON public.ai_generated_content USING btree ("isInitial");


--
-- TOC entry 3415 (class 1259 OID 25188)
-- Name: ai_content_subchapter_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_content_subchapter_idx ON public.ai_generated_content USING btree ("subchapterId");


--
-- TOC entry 3416 (class 1259 OID 25191)
-- Name: ai_content_subchapter_initial_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_content_subchapter_initial_idx ON public.ai_generated_content USING btree ("subchapterId", "isInitial");


--
-- TOC entry 3419 (class 1259 OID 25190)
-- Name: ai_content_version_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX ai_content_version_idx ON public.ai_generated_content USING btree (version);


--
-- TOC entry 3422 (class 1259 OID 25195)
-- Name: chapters_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX chapters_active_idx ON public.chapters USING btree ("isActive");


--
-- TOC entry 3423 (class 1259 OID 25194)
-- Name: chapters_order_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX chapters_order_idx ON public.chapters USING btree ("order");


--
-- TOC entry 3426 (class 1259 OID 25197)
-- Name: chapters_subject_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX chapters_subject_active_idx ON public.chapters USING btree ("subjectId", "isActive");


--
-- TOC entry 3427 (class 1259 OID 25193)
-- Name: chapters_subject_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX chapters_subject_idx ON public.chapters USING btree ("subjectId");


--
-- TOC entry 3428 (class 1259 OID 25196)
-- Name: chapters_subject_order_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX chapters_subject_order_idx ON public.chapters USING btree ("subjectId", "order");


--
-- TOC entry 3429 (class 1259 OID 25192)
-- Name: chapters_title_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX chapters_title_idx ON public.chapters USING btree (title);


--
-- TOC entry 3432 (class 1259 OID 25199)
-- Name: grades_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX grades_active_idx ON public.grades USING btree ("isActive");


--
-- TOC entry 3435 (class 1259 OID 25198)
-- Name: grades_title_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX grades_title_idx ON public.grades USING btree (title);


--
-- TOC entry 3466 (class 1259 OID 25220)
-- Name: materials_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX materials_active_idx ON public.subchapter_materials USING btree ("isActive");


--
-- TOC entry 3467 (class 1259 OID 25218)
-- Name: materials_subchapter_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX materials_subchapter_idx ON public.subchapter_materials USING btree ("subchapterId");


--
-- TOC entry 3468 (class 1259 OID 25219)
-- Name: materials_type_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX materials_type_idx ON public.subchapter_materials USING btree ("fileType");


--
-- TOC entry 3469 (class 1259 OID 25221)
-- Name: materials_uploaded_by_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX materials_uploaded_by_idx ON public.subchapter_materials USING btree ("uploadedBy");


--
-- TOC entry 3438 (class 1259 OID 25203)
-- Name: metahuman_sessions_created_at_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX metahuman_sessions_created_at_idx ON public.metahuman_sessions USING btree ("createdAt");


--
-- TOC entry 3441 (class 1259 OID 25202)
-- Name: metahuman_sessions_status_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX metahuman_sessions_status_idx ON public.metahuman_sessions USING btree (status);


--
-- TOC entry 3442 (class 1259 OID 25201)
-- Name: metahuman_sessions_subchapter_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX metahuman_sessions_subchapter_idx ON public.metahuman_sessions USING btree ("subchapterId");


--
-- TOC entry 3443 (class 1259 OID 25200)
-- Name: metahuman_sessions_user_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX metahuman_sessions_user_idx ON public.metahuman_sessions USING btree ("userId");


--
-- TOC entry 3444 (class 1259 OID 25204)
-- Name: metahuman_sessions_user_subchapter_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX metahuman_sessions_user_subchapter_idx ON public.metahuman_sessions USING btree ("userId", "subchapterId");


--
-- TOC entry 3445 (class 1259 OID 25210)
-- Name: quiz_attempts_completed_at_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quiz_attempts_completed_at_idx ON public.quiz_attempts USING btree ("completedAt");


--
-- TOC entry 3446 (class 1259 OID 25208)
-- Name: quiz_attempts_passed_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quiz_attempts_passed_idx ON public.quiz_attempts USING btree (passed);


--
-- TOC entry 3449 (class 1259 OID 25206)
-- Name: quiz_attempts_quiz_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quiz_attempts_quiz_idx ON public.quiz_attempts USING btree ("quizId");


--
-- TOC entry 3450 (class 1259 OID 25207)
-- Name: quiz_attempts_score_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quiz_attempts_score_idx ON public.quiz_attempts USING btree (score);


--
-- TOC entry 3451 (class 1259 OID 25205)
-- Name: quiz_attempts_user_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quiz_attempts_user_idx ON public.quiz_attempts USING btree ("userId");


--
-- TOC entry 3452 (class 1259 OID 25209)
-- Name: quiz_attempts_user_quiz_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quiz_attempts_user_quiz_idx ON public.quiz_attempts USING btree ("userId", "quizId");


--
-- TOC entry 3453 (class 1259 OID 25212)
-- Name: quiz_questions_order_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quiz_questions_order_idx ON public.quiz_questions USING btree ("order");


--
-- TOC entry 3456 (class 1259 OID 25211)
-- Name: quiz_questions_quiz_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quiz_questions_quiz_idx ON public.quiz_questions USING btree ("quizId");


--
-- TOC entry 3457 (class 1259 OID 25213)
-- Name: quiz_questions_quiz_order_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quiz_questions_quiz_order_idx ON public.quiz_questions USING btree ("quizId", "order");


--
-- TOC entry 3458 (class 1259 OID 25216)
-- Name: quizzes_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quizzes_active_idx ON public.quizzes USING btree ("isActive");


--
-- TOC entry 3461 (class 1259 OID 25217)
-- Name: quizzes_subchapter_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quizzes_subchapter_active_idx ON public.quizzes USING btree ("subchapterId", "isActive");


--
-- TOC entry 3462 (class 1259 OID 25215)
-- Name: quizzes_subchapter_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quizzes_subchapter_idx ON public.quizzes USING btree ("subchapterId");


--
-- TOC entry 3465 (class 1259 OID 25214)
-- Name: quizzes_title_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX quizzes_title_idx ON public.quizzes USING btree (title);


--
-- TOC entry 3472 (class 1259 OID 25225)
-- Name: subchapters_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subchapters_active_idx ON public.subchapters USING btree ("isActive");


--
-- TOC entry 3473 (class 1259 OID 25227)
-- Name: subchapters_chapter_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subchapters_chapter_active_idx ON public.subchapters USING btree ("chapterId", "isActive");


--
-- TOC entry 3474 (class 1259 OID 25223)
-- Name: subchapters_chapter_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subchapters_chapter_idx ON public.subchapters USING btree ("chapterId");


--
-- TOC entry 3475 (class 1259 OID 25226)
-- Name: subchapters_chapter_order_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subchapters_chapter_order_idx ON public.subchapters USING btree ("chapterId", "order");


--
-- TOC entry 3476 (class 1259 OID 25224)
-- Name: subchapters_order_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subchapters_order_idx ON public.subchapters USING btree ("order");


--
-- TOC entry 3481 (class 1259 OID 25222)
-- Name: subchapters_title_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subchapters_title_idx ON public.subchapters USING btree (title);


--
-- TOC entry 3482 (class 1259 OID 25230)
-- Name: subjects_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subjects_active_idx ON public.subjects USING btree ("isActive");


--
-- TOC entry 3483 (class 1259 OID 25231)
-- Name: subjects_grade_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subjects_grade_active_idx ON public.subjects USING btree ("gradeId", "isActive");


--
-- TOC entry 3484 (class 1259 OID 25229)
-- Name: subjects_grade_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subjects_grade_idx ON public.subjects USING btree ("gradeId");


--
-- TOC entry 3489 (class 1259 OID 25228)
-- Name: subjects_title_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX subjects_title_idx ON public.subjects USING btree (title);


--
-- TOC entry 3492 (class 1259 OID 25234)
-- Name: user_progress_status_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX user_progress_status_idx ON public.user_progress USING btree (status);


--
-- TOC entry 3493 (class 1259 OID 25233)
-- Name: user_progress_subchapter_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX user_progress_subchapter_idx ON public.user_progress USING btree ("subchapterId");


--
-- TOC entry 3494 (class 1259 OID 25232)
-- Name: user_progress_user_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX user_progress_user_idx ON public.user_progress USING btree ("userId");


--
-- TOC entry 3495 (class 1259 OID 25235)
-- Name: user_progress_user_status_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX user_progress_user_status_idx ON public.user_progress USING btree ("userId", status);


--
-- TOC entry 3498 (class 1259 OID 25238)
-- Name: users_active_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX users_active_idx ON public.users USING btree ("isActive");


--
-- TOC entry 3499 (class 1259 OID 25239)
-- Name: users_created_at_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX users_created_at_idx ON public.users USING btree ("createdAt");


--
-- TOC entry 3500 (class 1259 OID 25236)
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- TOC entry 3505 (class 1259 OID 25237)
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: reffrains
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- TOC entry 3506 (class 2606 OID 25107)
-- Name: ai_chat_logs ai_chat_logs_subchapterId_subchapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.ai_chat_logs
    ADD CONSTRAINT "ai_chat_logs_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES public.subchapters(id) ON DELETE CASCADE;


--
-- TOC entry 3507 (class 2606 OID 25102)
-- Name: ai_chat_logs ai_chat_logs_userId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.ai_chat_logs
    ADD CONSTRAINT "ai_chat_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3508 (class 2606 OID 25112)
-- Name: ai_generated_content ai_generated_content_subchapterId_subchapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.ai_generated_content
    ADD CONSTRAINT "ai_generated_content_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES public.subchapters(id) ON DELETE CASCADE;


--
-- TOC entry 3509 (class 2606 OID 25117)
-- Name: chapters chapters_subjectId_subjects_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT "chapters_subjectId_subjects_id_fk" FOREIGN KEY ("subjectId") REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- TOC entry 3510 (class 2606 OID 25127)
-- Name: metahuman_sessions metahuman_sessions_subchapterId_subchapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.metahuman_sessions
    ADD CONSTRAINT "metahuman_sessions_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES public.subchapters(id) ON DELETE CASCADE;


--
-- TOC entry 3511 (class 2606 OID 25122)
-- Name: metahuman_sessions metahuman_sessions_userId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.metahuman_sessions
    ADD CONSTRAINT "metahuman_sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3512 (class 2606 OID 25137)
-- Name: quiz_attempts quiz_attempts_quizId_quizzes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT "quiz_attempts_quizId_quizzes_id_fk" FOREIGN KEY ("quizId") REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- TOC entry 3513 (class 2606 OID 25132)
-- Name: quiz_attempts quiz_attempts_userId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT "quiz_attempts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3514 (class 2606 OID 25142)
-- Name: quiz_questions quiz_questions_quizId_quizzes_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.quiz_questions
    ADD CONSTRAINT "quiz_questions_quizId_quizzes_id_fk" FOREIGN KEY ("quizId") REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- TOC entry 3515 (class 2606 OID 25147)
-- Name: quizzes quizzes_subchapterId_subchapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT "quizzes_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES public.subchapters(id) ON DELETE CASCADE;


--
-- TOC entry 3516 (class 2606 OID 25152)
-- Name: subchapter_materials subchapter_materials_subchapterId_subchapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.subchapter_materials
    ADD CONSTRAINT "subchapter_materials_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES public.subchapters(id) ON DELETE CASCADE;


--
-- TOC entry 3517 (class 2606 OID 25157)
-- Name: subchapter_materials subchapter_materials_uploadedBy_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.subchapter_materials
    ADD CONSTRAINT "subchapter_materials_uploadedBy_users_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES public.users(id);


--
-- TOC entry 3518 (class 2606 OID 25162)
-- Name: subchapters subchapters_chapterId_chapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.subchapters
    ADD CONSTRAINT "subchapters_chapterId_chapters_id_fk" FOREIGN KEY ("chapterId") REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- TOC entry 3519 (class 2606 OID 25167)
-- Name: subjects subjects_gradeId_grades_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT "subjects_gradeId_grades_id_fk" FOREIGN KEY ("gradeId") REFERENCES public.grades(id) ON DELETE CASCADE;


--
-- TOC entry 3520 (class 2606 OID 25177)
-- Name: user_progress user_progress_subchapterId_subchapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT "user_progress_subchapterId_subchapters_id_fk" FOREIGN KEY ("subchapterId") REFERENCES public.subchapters(id) ON DELETE CASCADE;


--
-- TOC entry 3521 (class 2606 OID 25172)
-- Name: user_progress user_progress_userId_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: reffrains
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT "user_progress_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3686 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: reffrains
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-08-20 06:53:16

--
-- PostgreSQL database dump complete
--

