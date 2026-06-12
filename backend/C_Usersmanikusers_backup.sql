--
-- PostgreSQL database dump
--

\restrict WQh3lGdhbgjzoAYXL44ue4TeKMTyiKexRfgQ7OZSsbRIlGz4VNDugXBMxLVh5h7

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, role, name, "smtpUser", "smtpPass", "createdAt") FROM stdin;
cmol77u2600018up1bf2n624n	m@fingrow.in	$2a$10$2jqd3GrNwBpA0W6Nw3KO8ebvdzo24YyXZh205WGpqmQRp8urk1Om2	USER	poorna	\N	\N	2026-04-30 08:04:58.735
cmol5f4ck0000hi8f050zj77g	harish.m@fingrow.in	$2a$10$SGoPxqGTact1HeaObXOwGOqdPSe0lSa/P08Rhd5lY8jBGV6mhnB2S	ADMIN	Harish M	\N	\N	2026-04-30 07:14:39.429
cmol5f4e60001hi8fhogv3n2c	lokesh.vasuz@fingrow.in	$2a$10$E6BaZsPcjj.yWXOYkrRIK.HnePT1SYDZB7U43GhV7QyJsLpWaKXBW	ADMIN	Lokesh V	\N	\N	2026-04-30 07:14:39.486
cmol5f4fo0002hi8f2j2x2c6y	admin@fingrow.in	$2a$10$BDVbOOIyKYX52wJjF9yDX.CHJZSg.G/J55VgraHvDryqJbOTLXK22	ADMIN	Admin	\N	\N	2026-04-30 07:14:39.541
\.


--
-- PostgreSQL database dump complete
--

\unrestrict WQh3lGdhbgjzoAYXL44ue4TeKMTyiKexRfgQ7OZSsbRIlGz4VNDugXBMxLVh5h7

