"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Col, Form, FormControl, FormGroup, FormLabel } from "react-bootstrap";
import { useForm, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import ComponentContainerCard from "@/components/ComponentContainerCard";
import Avatar from "./Avatar";

const BrowserDefault = () => {
    const { control, handleSubmit, setValue, watch } = useForm({
        defaultValues: {
            companyName: "",
            email: "",
            nicho: "",
            foto: "",
            desconto: "Carregando...", // Inicializa com "Carregando..."
        },
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const fotoUrl = watch("foto") || "/assets/images/avatar.jpg";

    useEffect(() => {
        // Buscar dados do perfil do parceiro
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/parceiro/perfil");
                if (!response.ok) throw new Error("Erro ao buscar perfil");
                
                const data = await response.json();
                setValue("companyName", data.nome_empresa || "");
                setValue("email", data.email || "");
                setValue("nicho", data.nicho || "");
                setValue("foto", data.foto || "");
                
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        // Buscar desconto do parceiro separadamente
        const fetchDiscount = async () => {
            try {
                const response = await fetch("/api/parceiro/voucher");
                if (!response.ok) throw new Error("Erro ao buscar desconto");

                const data = await response.json();
                setValue("desconto", data.desconto || "Nenhum desconto disponível");
            } catch (err) {
                setValue("desconto", "Nenhum desconto disponível");
            }
        };

        fetchProfile();
        fetchDiscount();
    }, [setValue]);

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValue("foto", reader.result);
            };
            reader.readAsDataURL(file);
        }
    }, [setValue]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: "image/*",
        multiple: false,
    });

    const onSubmit = async (formData) => {
        setMessage(null);
        setError(null);

        try {
            const response = await fetch("/api/parceiro/perfil", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome_empresa: formData.companyName,
                    email: formData.email,
                    foto: formData.foto,
                    nicho: formData.nicho,
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro ao atualizar perfil");

            setMessage("Perfil atualizado com sucesso!");
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="text-center">Carregando perfil...</div>;
    }

    return (
        <ComponentContainerCard id="browser-defaults" title="Perfil do Parceiro" description="Atualize suas informações de perfil.">
            {error && <p className="text-danger">{error}</p>}
            {message && <p className="text-success">{message}</p>}

            <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
                <Col xs={12} className="text-center">
                    <div {...getRootProps()} style={{ cursor: "pointer" }}>
                        <input {...getInputProps()} />
                        <Avatar src={fotoUrl} alt="Foto do Parceiro" />
                    </div>
                </Col>

                <Col md={6}>
                    <FormGroup>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <Controller name="companyName" control={control} render={({ field }) => <FormControl type="text" {...field} required />} />
                    </FormGroup>
                </Col>

                <Col md={6}>
                    <FormGroup>
                        <FormLabel>E-mail</FormLabel>
                        <Controller name="email" control={control} render={({ field }) => <FormControl type="email" {...field} disabled />} />
                    </FormGroup>
                </Col>

                <Col md={6}>
                    <FormGroup>
                        <FormLabel>Nicho de Atuação</FormLabel>
                        <Controller name="nicho" control={control} render={({ field }) => <FormControl type="text" {...field} required />} />
                    </FormGroup>
                </Col>

                <Col md={6}>
                <FormGroup>
        <FormLabel>Desconto</FormLabel>
        <Controller
            name="desconto"
            control={control}
            render={({ field }) => (
                <FormControl
                    type="text"
                    {...field}
                    value={isNaN(field.value) || field.value === "Nenhum desconto disponível" 
                        ? field.value 
                        : `${field.value}%`}
                    disabled
                />
            )}
        />
    </FormGroup>
                </Col>

                <Col xs={12}>
                    <Button variant="primary" type="submit">Salvar Alterações</Button>
                </Col>
            </form>
        </ComponentContainerCard>
    );
};

export default BrowserDefault;
